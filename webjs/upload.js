const SusAnalyzer = require('sus-analyzer')

const sus_area = document.getElementById('sus_area')

const sus_songname = document.getElementById('sus_songname')
const sus_artist = document.getElementById('sus_artist')
const sus_designer = document.getElementById('sus_designer')
const sus_difficulty = document.getElementById('sus_difficulty')
const sus_playlevel = document.getElementById('sus_playlevel')
const sus_basebpm = document.getElementById('sus_basebpm')

sus_area.onkeyup = () => {
  let meta = SusAnalyzer.getMeta(sus_area.value)

  sus_songname.value = meta.TITLE || ''
  sus_artist.value = meta.ARTIST || ''
  sus_designer.value = meta.DESIGNER || ''
  sus_difficulty.value = meta.DIFFICULTY.LEVEL || ''
  sus_playlevel.value = meta.PLAYLEVEL || ''
  sus_basebpm.value = meta.BASEBPM || ''
}

