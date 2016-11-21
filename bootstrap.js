const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

var menuID;

function loadIntoWindow(window) {
  if (!window)
    return;

  let label = "Total Title";
  let selector =  window.NativeWindow.contextmenus.SelectorContext("img[title]");
  menuID = window.NativeWindow.contextmenus.add(label, selector, function(target) {
    var toast = false;
    try {
      toast = Services.prefs.getBoolPref("extensions.totaltitle.toast");
    } catch (ex) {}
    if (toast) {
      window.NativeWindow.toast.show(target.getAttribute("title"), "long");
    } else {
      window.NativeWindow.doorhanger.show(target.getAttribute("title"), "totaltitle", [], window.BrowserApp.selectedTab.id);
    }
  });
}
 
function unloadFromWindow(window) {
  if (!window) {
    return;
  }
  window.NativeWindow.contextmenus.remove(menuID);      
}
 
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};
 
function startup(aData, aReason) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
  // Load into any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }
 
  // Load into any new windows
  wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;
 
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
  // Stop listening for new windows
  wm.removeListener(windowListener);
 
  // Unload from any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}
 
function install(aData, aReason) {
}
function uninstall(aData, aReason) {
}
