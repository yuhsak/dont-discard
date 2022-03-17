const __default = { id: 'a', value: '^https?://.*' }

const isTarget = async (url) => {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ fields: [] }, (state) => {
      const fields = state.fields.length ? state.fields : [__default]
      const value = fields.some(({ value }) => {
        const regexp = new RegExp(value)
        return regexp.test(url)
      })
      resolve(value)
    })
  })
}

const ifTarget = (cb) => async (tab) => {
  if (tab.url && (await isTarget(tab.url))) {
    cb(tab)
  }
}

const disable = ifTarget((tab) => {
  chrome.tabs.update(tab.id, { autoDiscardable: false })
})

const disables = (tabs) => tabs.forEach(disable)

const disableById = (tabId) => chrome.tabs.get(tabId, disable)

const disableThird = (a, b, tab) => disable(tab)

chrome.tabs.onCreated.addListener(disable)

chrome.tabs.onReplaced.addListener(disableById)

chrome.tabs.onUpdated.addListener(disableThird)
