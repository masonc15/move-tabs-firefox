'use strict';

let setState = state => {
  if (state === null) {
    sessionStorage.removeItem('state');
    browser.browserAction.setBadgeText({ text: '' });
  } else {
    sessionStorage.setItem('state', JSON.stringify(state));
    browser.browserAction.setBadgeText({ text: '?' });
  }
};

let getState = () => JSON.parse(sessionStorage.getItem('state'));

browser.browserAction.onClicked.addListener(currentTab => {
  let state = getState();
  if (state) {
    setState(null);
  } else {
    browser.tabs.query({ currentWindow: true, highlighted: true },
      highlightedTabs => {
        setState({
          tabs: highlightedTabs.map(tab => tab.id),
          currentTab: currentTab.id,
          window: currentTab.windowId
        });
      });
  }
});

browser.windows.onFocusChanged.addListener(windowId => {
  if (windowId != browser.windows.WINDOW_ID_NONE) {
    let state = getState();
    if (state) {
      if (windowId != state.window) {
        setState(null);
        browser.tabs.move(state.tabs, { windowId: windowId, index: -1 }, () => {
          browser.tabs.update(state.currentTab, { active: true });
        });
      }
    }
  }
});
