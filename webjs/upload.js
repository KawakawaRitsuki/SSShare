const SusAnalyzer = require('sus-analyzer')

const form = document.getElementById('upload')

const sus_area = document.getElementById('sus_area')

const sus_songid = document.getElementById('sus_songid')
const sus_songname = document.getElementById('sus_songname')
const sus_artist = document.getElementById('sus_artist')
const sus_designer = document.getElementById('sus_designer')
const sus_difficulty = document.getElementById('sus_difficulty')
const sus_playlevel = document.getElementById('sus_playlevel')

const sus_file = document.getElementById("sus_file")

const submit_btn = document.getElementById('submit_btn')
const submit2_btn = document.getElementById('submit2_btn')

const yt_link = document.getElementById('yt_link')
const note = document.getElementById('note')
const check1 = document.getElementById('check1')
const check2 = document.getElementById('check2')

sus_area.onkeyup = check
sus_area.onchange = check

check()

function check() {
  form_stat(sus_area,SusAnalyzer.validate(sus_area.value).VALIDITY)
  let meta = SusAnalyzer.getMeta(sus_area.value)

  sus_songname.value = meta.TITLE || ''
  sus_songid.value = meta.SONGID || ''
  sus_artist.value = meta.ARTIST || ''
  sus_designer.value = meta.DESIGNER || ''
  sus_difficulty.value = meta.DIFFICULTY.LEVEL || ''
  sus_playlevel.value = meta.PLAYLEVEL || ''

  let s = true
  s = form_stat(sus_songname,meta.TITLE) ? s : false
  s = form_stat(sus_songid,meta.SONGID) ? s : false
  s = form_stat(sus_artist,meta.ARTIST) ? s : false
  s = form_stat(sus_designer,meta.DESIGNER) ? s : false
  s = form_stat(sus_difficulty,meta.DIFFICULTY.LEVEL) ? s : false
  s = form_stat(sus_playlevel,meta.PLAYLEVEL) ? s : false
  submit_btn.disabled = !s
}

function form_stat(target,stat) {
  if(stat) {
    target.classList.add('uk-form-success')
    target.classList.remove('uk-form-danger')
    return true
  } else {
    target.classList.remove('uk-form-success')
    target.classList.add('uk-form-danger')
    return false
  }
}

sus_file.addEventListener('change',e => {
  if(sus_area.value != "") {
    if (sus_file.files[0])
      UIkit.modal.confirm('現在入力されているsusが消えますがよろしいですか？')
        .then(() => {
          UIkit.modal(form).show()
          let reader = new FileReader()
          reader.readAsText(sus_file.files[0], "UTF-8")
          reader.onload = evt => { sus_area.value = evt.target.result;sus_file.value = ""; check() }
        },() => UIkit.modal(element).show())
  } else {
    let reader = new FileReader()
    reader.readAsText(sus_file.files[0], "UTF-8")
    reader.onload = evt => { sus_area.value = evt.target.result;sus_file.value = ""; check() }
  }
})

check1.onchange = checkbox
check2.onchange = checkbox
function checkbox() {
  submit2_btn.disabled = !(check1.checked && check2.checked)
}

submit2_btn.onclick = () => {
  const form = document.createElement('form')
  const input = document.createElement('input')

  form.method = 'POST'
  form.action = '/score/new'

  input.name = 'sus'
  input.value = sus_area.value
  form.appendChild(input)
  input.name = 'yt'
  input.value = yt_link.value
  form.appendChild(input)
  input.name = 'sus'
  input.value = note.value
  form.appendChild(input)

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}
