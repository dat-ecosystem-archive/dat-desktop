module.exports = {
  login: function (config) {
    const lock = new Auth0Lock(
      config.AUTH0_KEY,
      config.AUTH0_URL,
      {
        languageDictionary: {
          title: 'Welcome!'
        },
        theme: {
          primaryColor: '#35B44F',
          logo: 'public/img/dat-data-logo.svg'
        },
        auth: {
          sso: false,
          redirect: false
        }
      }
    )
    let authed = false

    lock.on('authenticated', ({idToken}) => {
      localStorage.setItem('id_token', idToken)
      lock.getProfile(idToken, (err, profile) => {
        if (err) throw err
        localStorage.setItem('profile', JSON.stringify(profile))
        console.log(profile)
      })
    })
    lock.show()
  },
  logout: function () {
    localStorage.removeItem('id_token')
    localStorage.removeItem('profile')
  }
}
