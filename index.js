const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')

const CurrentGuildStore = getModule(['getLastSelectedGuildId'], false)
const SortedGuildStore = getModule(['getSortedGuilds'], false)
const GuildActions = getModule(['markGuildAsRead'], false)
const GuildFolderStore = getModule(['getExpandedFolders'], false)


class AutoCollapseFolders extends Plugin {
  startPlugin () {
    this._currentGuildID = CurrentGuildStore.getLastSelectedGuildId()
    CurrentGuildStore.addChangeListener(this._changeListener)
  }

  pluginWillUnload () {
    CurrentGuildStore.removeChangeListener(this._changeListener)
  }

  _changeListener = () => {
    const prevGuildID = this._currentGuildID
    const currGuildID = CurrentGuildStore.getLastSelectedGuildId()

    const prevFolderID = this.getFolderIDFromGuildID(prevGuildID)
    const currFolderID = this.getFolderIDFromGuildID(currGuildID)

    if (
      prevFolderID &&
      prevFolderID !== currFolderID &&
      GuildFolderStore.isFolderExpanded(prevFolderID)
    ) {
      setTimeout(() => {
        GuildActions.toggleGuildFolderExpand(prevFolderID)
      }, 250)
    }
    
    this._currentGuildID = currGuildID
  }

  getFolderIDFromGuildID (guildID) {
    for (let folder of SortedGuildStore.guildFolders) {
      if (!folder.folderId) continue
      if (folder.guildIds.includes(guildID)) return folder.folderId
    }

    return undefined
  }
}

module.exports = AutoCollapseFolders
