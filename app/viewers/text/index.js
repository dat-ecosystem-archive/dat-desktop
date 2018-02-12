document.body.innerHTML = 'Hello World!'

const main = async () => {
  document.body.innerHTML += window.seek
  document.body.innerHTML += await window.seek(0, 10)
}

main().catch(err => console.error(err))
