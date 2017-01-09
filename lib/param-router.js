var assert = require('assert')

module.exports = router

function router (routes) {
  assert.equal(typeof routes, 'object', 'param-router: routes should be type object')
  assert.equal(typeof routes.default, 'function', 'param-router: routes.default should be type function')

  return function (state, prev, send) {
    var searchKeys = Object.keys(state.location.search)
    var len = searchKeys.length
    for (var i = 0; i < len; i++) {
      var key = searchKeys[i]
      var route = routes[key]
      if (route) return route.call(routes, state, prev, send)
    }

    return routes.default(state, prev, send)
  }
}
