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
const music_s = document.getElementById('music_s')
const music_o = document.getElementById('music_o')
const movie_s = document.getElementById('movie_s')
const movie_o = document.getElementById('movie_o')
const jacket = document.getElementById('jacket')
const checkbox1 = document.getElementById('check1')
const checkbox2 = document.getElementById('check2')

sus_area.onkeyup = check
sus_area.onchange = check

check()
check2()

function check() {
  form_stat(sus_area,SusAnalyzer.validate(sus_area.value).VALIDITY)
  let meta = SusAnalyzer.getMeta(sus_area.value)

  sus_songname.value = meta.TITLE || ''
  sus_songid.value = meta.SONGID || ''
  sus_artist.value = meta.ARTIST || ''
  sus_designer.value = meta.DESIGNER || ''
  sus_difficulty.value = meta.DIFFICULTY.TEXT || ''
  sus_playlevel.value = meta.DIFFICULTY.LEVEL === 4 ? meta.DIFFICULTY.MARK || '' : meta.PLAYLEVEL.TEXT || ''

  let s = true
  s = form_stat(sus_songname,meta.TITLE) ? s : false
  s = form_stat(sus_songid,meta.SONGID) ? s : false
  s = form_stat(sus_artist,meta.ARTIST) ? s : false
  s = form_stat(sus_designer,meta.DESIGNER) ? s : false
  s = form_stat(sus_difficulty,meta.DIFFICULTY.LEVEL >= 0 ) ? s : false
  s = form_stat(sus_playlevel,meta.DIFFICULTY.LEVEL === 4 || meta.PLAYLEVEL.LEVEL) ? s : false
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
        },() => UIkit.modal(form).show())
  } else {
    let reader = new FileReader()
    reader.readAsText(sus_file.files[0], "UTF-8")
    reader.onload = evt => { sus_area.value = evt.target.result;sus_file.value = ""; check() }
  }
})

checkbox1.onchange = check2; checkbox2.onchange = check2
music_s.onkeyup = check2; music_s.onchange = check2
music_o.onkeyup = check2; music_o.onchange = check2
movie_s.onkeyup = check2; movie_s.onchange = check2
movie_o.onkeyup = check2; movie_o.onchange = check2
yt_link.onkeyup = check2; yt_link.onchange = check2
jacket.onkeyup = check2; jacket.onchange = check2

function check2() {
  let s = true
  if(music_s.value != "") {
    s = form_stat(music_o,music_o.value != "") ? s : false
    music_o.disabled = false
  } else {
    music_o.disabled = true
    music_o.classList.remove('uk-form-success')
    music_o.classList.remove('uk-form-danger')
  }
  if(movie_s.value != "") {
    s = form_stat(movie_o,movie_o.value != "") ? s : false
    movie_o.disabled = false
  } else {
    movie_o.disabled = true
    movie_o.classList.remove('uk-form-success')
    movie_o.classList.remove('uk-form-danger')
  }
  if(yt_link.value != "") {
    s = form_stat(yt_link,yt_link.value.match(/^http[s]*:\/\/www.youtube.com\/watch\?v=\w{11}/)) ? s : false
  } else {
    yt_link.classList.remove('uk-form-success')
    yt_link.classList.remove('uk-form-danger')
  }
  s = checkbox1.checked && checkbox2.checked ? s : false
  submit2_btn.disabled = !s
}

submit2_btn.onclick = () => {
  const form = document.createElement('form')
  form.style.display = "none"

  form.method = 'POST'
  form.action = '/score/new'

  const input1 = document.createElement('textarea')
  input1.name = 'sus'
  input1.value = sus_area.value
  form.appendChild(input1)
  const input2 = document.createElement('input')
  input2.name = 'yt'
  input2.value = yt_link.value
  form.appendChild(input2)
  const input3 = document.createElement('input')
  input3.name = 'note'
  input3.value = note.value
  form.appendChild(input3)
  const input4 = document.createElement('input')
  input4.name = 'music_s'
  input4.value = music_s.value
  form.appendChild(input4)
  const input5 = document.createElement('input')
  input5.name = 'music_o'
  input5.value = music_o.value
  form.appendChild(input5)
  const input6 = document.createElement('input')
  input6.name = 'movie_s'
  input6.value = movie_s.value
  form.appendChild(input6)
  const input7 = document.createElement('input')
  input7.name = 'movie_o'
  input7.value = movie_o.value
  form.appendChild(input7)
  const input8 = document.createElement('input')
  input8.name = 'jacket'
  input8.value = jacket.value
  form.appendChild(input8)

  document.body.appendChild(form)
  form.submit()
}
