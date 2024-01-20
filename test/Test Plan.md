# Workspaces Test Plan
This document contains a list of steps to verify proper functionality of Workspaces. It is used mainly for manual testing before release. However, it might be also used for creating test automation in the future.

**Used Abbreviations**
- PREQ = Prerequisite
- EXP = Expected result
- TBD = To be defined

---

## 1. Installation

### 1.1 Show Welcome page after installation
- PREQ Workspaces extension is not installed
- Install extension from unpacked folder or ZIP file
- EXP Welcome page is opened
- EXP There are no errors on the extension Details page


## 2. Create and list workspaces

### 2.1 Show initial screen
- PREQ Extension is freshly installed
- Click the extension button
- EXP Initial placeholder screen with `Create Workspace` button is shown

### 2.2 Create first workspace
- PREQ 2.1
- Click `Create Workspace` button
- EXP `New Workspace` screen is shown
- Set Name=`Green`, Color=`green`, Create in this window=`true`
- Click `Create` button
- EXP New green tab group with title `Green` is created containing all tabs of the current window

### 2.3 Create second workspace
- PREQ 2.2
- Click the extension button
- EXP `Green` workspace is in the list
- Click `New` button
- EXP `New Workspace` screen is shown
- EXP `Create in this window` checkbox is hidden
- Set Name=`Blue`, Color=`blue`
- Click `Create` button
- EXP New window is created containing blue tab group with title `Blue`

### 2.4 Show workspace list
- PREQ 2.3
- Click the extension button
- EXP `Green` and `Blue` items are in the list

### 2.5 Reorder workspaces
- PREQ 2.4
- Drag `Green` item and drop it on `Blue` item
- EXP `Green` item is on the second position


## 3. Save workspace

### 3.1 Open tabs
- PREQ 2.2
- Open new browser window
- Focus the `Green` workspace window
- Open three tabs with `google.com`, `wikipedia.org`, `seznam.cz`
- EXP Tabs are added into the `Green` tab group

### 3.2 Save and restore tabs
- PREQ 3.1
- Pin the Google tab
- Click the Wikipedia tab to make it active
- Close the `Green` window
- Use other window to click the extension button and select `Green` workspace from the popup
- EXP New window with `Green` tab group is opened
- EXP The tab group contains Google, Wikipedia, and Seznam tabs
- EXP Google tab is pinned
- EXP Wikipedia tab is active


## 4. Switch workspace

### 4.1 Focus workspace
- PREQ 2.3
- Click the extension button and select `Green` workspace
- EXP `Green` workspace window is focused
- Click the extension button and select `Blue` workspace
- EXP `Blue` workspace window is focused
- Close the `Blue` workspace window
- EXP `Green` workspace window is focused

### 4.2 Open workspace
- PREQ 4.1
- Click the extension button and select `Blue` workspace
- EXP `Blue` workspace window is opened and focused

### 4.3 Preserve window dimensions
- PREQ 4.1
- Click the extension button and select `Blue` workspace
- EXP `Blue` workspace window is opened with the same size and position as previously focused window

### 4.4 Preserve window dimensions (maximized)
- PREQ 4.1
- Maximize the `Green` workspace window
- Click the extension button and select `Blue` workspace
- EXP `Blue` workspace window is opened and maximized


## 5. Workspace properties

### 5.1 Update workspace properties
- PREQ 2.2
- Click the extension button
- Hover over `Green` item and click the three dots
- EXP `Edit Workspace` screen is shown
- Set Name=`Red` and Color=`red`
- Click `Done`
- EXP Tab group color is now red with title `Red` 

### 5.2 Update tab group properties
- PREQ 2.2
- Edit the `Green` tab group and set title to `Red` and color to red
- Click the extension button
- EXP Name=`Red` and Color=`red`


## 6. Remove workspace

### 6.1 Remove inactive workspace
- PREQ 2.3
- Close `Green` workspace window
- Click the extension button
- Hover over `Green` item and click the three dots
- Click `Remove` button
- EXP `Remove Workspace` screen is shown
- Click `Remove` button
- Click the extension button
- EXP `Green` workspace is not present in the list

### 6.2 Remove active workspace
- PREQ 2.2
- Focus `Green` workspace window
- Click the extension button
- Hover over `Green` item and click the three dots
- Click `Remove` button
- EXP `Remove Workspace` screen is shown
- Click `Remove` button
- EXP `Green` tab group is destroyed but its tabs are preserved
- Click the extension button
- EXP `Green` workspace is not present in the list


## 7. Restore workspace

### 7.1 Restore window
- PREQ 3.1
- Open another browser window
- Close `Green` workspace window
- Press <kbd>Ctrl/Cmd + Shift + T</kbd>
- EXP `Green` workspace window is opened again
- Click the extension button
- EXP `Green` item is active (highlighted)

### 7.2 Restore multiple windows
- PREQ 2.3
- Go to browser `Setting > On start-up` and select `Continue where you left off`
- Press <kbd>Ctrl/Cmd + Q</kbd> to quit browser
- Open the browser again
- EXP `Green` and `Blue` workspaces are opened again
- Click the extension button and select `Green` workspace
- EXP Existing `Green` workspace window is focused
- Click the extension button and select `Blue` workspace
- EXP Existing `Blue` workspace window is focused


## 8. Tab operations

### 8.1 Open tab
- PREQ 2.2
- Open a new tab with `example.com`
- Close the `Green` workspace and open it again
- `example.com` tab exists and is active

### 8.2 Close tab 
- PREQ 8.1
- Close the `example.com` tab
- Close the `Green` workspace and open it again
- `example.com` tab does not exist

### 8.3 Detach tab
- PREQ 8.1
- Detach the `example.com` tab from the `Green` workspace window
- Close the `Green` workspace and open it again
- `example.com` tab is not present in the `Green` workspace window

### 8.4 Attach tab
- PREQ 8.3
- Attach the `example.com` tab from the other window back to the `Green` workspace window
- Close the `Green` workspace and open it again
- `example.com` tab exists and is active

### 8.5 Ungroup tabs
- TBD

### 8.6 Close tab group
- TBD

## 9. Keyboard control

### 9.1 Open list of workspaces
- PREQ 2.3
- Press <kbd>Alt/Option + W</kbd>
- EXP Workspace list is open

### 9.2 Select workspace
- PREQ 9.1
- Press <kbd>Arrow Down</kbd>
- EXP `Green` item is highlighted
- Press <kbd>Enter</kbd>
- EXP `Green` workspace window is focused

### 9.3 Edit workspace
- PREQ 2.2
- Click the extension button
- Hover over `Green` item and click the three dots
- EXP `Name` field is focused
- Press <kbd>Tab</kbd>
- EXP `Color` picker is focused
- Press <kbd>Arrow Left</kbd> to select previous color
- Press <kbd>Arrow Right</kbd> to select next color
- Press <kbd>Tab</kbd>
- EXP `Done` button is focused
- Press <kbd>Enter</kbd>
- EXP Workspace list screen is shown
- EXP Workspace color matches the selected color


## 10. Context Menu

### 10.1 Context menu item is hidden when there are no workspaces
- PREQ 1.1
- Open the page context menu with secondary mouse button
- EXP There is no `Move tab to workspace` item

### 10.2 New workspace is added to the menu
- PREQ 2.3
- Open the page context menu with secondary mouse button
- EXP There is `Move tab to workspace` submenu
- Open the submenu
- EXP There are two menu items: `Green` and `Blue`

### 10.3 Deleted workspace is removed from the menu
- PREQ 10.2
- Delete the `Green` workspace
- Open the page context menu with secondary mouse button
- Open the `Move tab to workspace` submenu
- EXP There is one menu item: `Blue`

### 10.4 Reordered workspace is updated in the menu
- PREQ 10.2
- Open the Workspace list and move `Blue` to the top of the list
- Open the page context menu with secondary mouse button
- Open the `Move tab to workspace` submenu
- EXP There are two menu items: `Blue` and `Green`

### 10.5 Renamed workspace is updated in the menu
- PREQ 10.2
- Rename the `Blue` workspace to `Red`
- Open the page context menu with secondary mouse button
- Open the `Move tab to workspace` submenu
- EXP There are two menu items: `Green` and `Red`

### 10.6 Move tab to another workspace
- PREQ 2.3
- Open a new tab with `seznam.cz` in `Blue` workspace
- Open the page context menu with secondary mouse button
- Open the `Move tab to workspace` submenu
- Click the `Green` item
- EXP `seznam.cz` tab has been moved from `Blue` to `Green` workspace


## 11. Options

### 11.1 Keep open other workspaces
- PREQ 2.3
- Open extension Options and set 'Other workspace windows' to `Keep open`
- Close `Blue` workspace and open it again
- EXP `Green` workspace window has stayed open

### 11.2 Minimize other workspaces
- PREQ 2.3
- Open extension Options and set 'Other workspace windows' to `Minimize`
- Close `Blue` workspace and open it again
- EXP `Green` workspace window has been minimized

### 11.3 Close other workspaces
- PREQ 2.3
- Open extension Options and set 'Other workspace windows' to `Close`
- Close `Blue` workspace and open it again
- EXP `Green` workspace window has been closed

### 11.4 Sort workspaces by name
- PREQ 2.3
- Open extension Options and set 'Sorting workspaces' to `By name`
- Click the extension button
- EXP `Blue` workspace is first in the list

### 11.5 Sort workspaces manually
- PREQ 11.4
- Open extension Options and set 'Sorting workspaces' to `Manually`
- Click the extension button
- EXP `Green` workspace is first in the list
- EXP Items can be reordered using drag & drop

### 11.6 Adding new items to the top
- PREQ 2.2
- Open extension Options and set 'Adding new items' to `To the top`
- Create a new workspace using steps in 2.3
- Click the extension button
- EXP Newly created `Blue` workspace is first in the list

### 11.7 Adding new items to the bottom
- PREQ 11.6
- Open extension Options and set 'Adding new items' to `To the bottom`
- Create a new workspace using steps in 2.3 called `Red`
- Click the extension button
- EXP Newly created `Red` workspace is last in the list
