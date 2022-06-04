# Workspaces Test Plan
This document contains a list of steps to verify proper functionality of Workspaces. It is used mainly for manual testing before release. However, it might be also used for creating integration tests in the future.

**Used Abbreviations**
- PREQ = Prerequisite
- EXP = Expected result
- TBD = To Be Defined

---

## 1. Create and list workspaces

### 1.1 Show initial screen
- PREQ Extension is freshly installed
- Click the extension button
- EXP Initial placeholder screen with `Create Workspace` button is shown

### 1.2 Create first workspace
- PREQ 1.1
- Click `Create Workspace` button
- EXP `New Workspace` screen is shown
- Set Name=`Green`, Color=`green`, Create in this window=`true`
- Click `Add` button
- EXP New green tab group with title `Green` is created containing all tabs of the current window

### 1.3 Create second workspace
- PREQ 1.2
- Click the extension button
- EXP `Green` workspace is in the list
- Click `New` button
- EXP `New Workspace` screen is shown
- EXP `Create in this window` checkbox is hidden
- Set Name=`Blue`, Color=`blue`
- Click `Add` button
- EXP New window is created containing blue tab group with title `Blue`

### 1.4 Show workspace list
- PREQ 1.3
- Click the extension button
- EXP `Green` and `Blue` items are in the list

### 1.5 Reorder workspaces
- PREQ 1.4
- Drag `Green` item and drop it on `Blue` item
- EXP `Green` item is on the second position


## 2. Save workspace

### 2.1 Open tabs
- PREQ 1.2
- Open new browser window
- Focus the `Green` workspace window
- Open three tabs with `google.com`, `wikipedia.com`, `seznam.cz`
- EXP Tabs are added into the `Green` tab group

### 2.2 Save and restore tabs
- PREQ 2.1
- Pin the Google tab
- Click the Wikipedia tab to make it active
- Close the `Green` window
- Click the extension button and select `Green` workspace from the popup
- EXP New window with `Green` tab group is opened
- EXP The tab group contains Google, Wikipedia, and Seznam tabs
- EXP Google tab is pinned
- EXP Wikipedia tab is active


## 3. Select workspace

### 3.1 Switch workspace
- PREQ 1.3
- Click the extension button and select `Green` workspace
- EXP `Green` workspace window is focused
- Click the extension button and select `Blue` workspace
- EXP `Blue` workspace window is focused

### 3.2 Open workspace
- PREQ 3.1
- Close the `Blue` workspace window
- Click the extension button and select `Blue` workspace
- EXP `Blue` workspace window is opened and focused


## 4. Workspace properties

### 4.1 Update workspace properties
- PREQ 1.2
- Click the extension button
- Hover over `Green` item and click the three dots
- EXP `Edit Workspace` screen is shown
- Set Name=`Red` and Color=`red`
- Click `Done`
- EXP Tab group color is now red with title `Red` 

### 4.2 Update tab group properties
- PREQ 1.2
- Set the `Green` tab group title to `Red` and color to red
- Click the extension button
- EXP Name=`Red` and Color=`red`


## 5. Remove workspace

### 5.1 Remove inactive workspace
- PREQ 1.3
- Close `Green` workspace window
- Click the extension button
- Hover over `Green` item and click the three dots
- Click `Remove` button
- EXP `Remove Workspace` screen is shown
- Click `Remove` button
- Click the extension button
- EXP `Green` workspace is not present in the list

### 5.2 Remove active workspace
- PREQ 1.2
- Focus `Green` workspace window
- Click the extension button
- Hover over `Green` item and click the three dots
- Click `Remove` button
- EXP `Remove Workspace` screen is shown
- Click `Remove` button
- EXP `Green` tab group is destroyed but its tabs are preserved
- Click the extension button
- EXP `Green` workspace is not present in the list


## 6. Restore workspace

### 6.1 Restore window
- PREQ 2.1
- Open another browser window
- Close `Green` workspace window
- Press <kbd>Ctrl/Cmd + Shift + T</kbd>
- EXP `Green` workspace window is opened again
- Click the extension button
- EXP `Green` item is active (highlighted)

### 6.2 Restore multiple windows
- PREQ 1.3
- Go to browser `Setting > On start-up` and select `Continue where you left off`
- Press <kbd>Ctrl/Cmd + Q</kbd> to quit browser
- Open the browser again
- EXP `Green` and `Blue` workspaces are opened again
- Click the extension button and select `Green` workspace
- EXP Existing `Green` workspace window is focused
- Click the extension button and select `Blue` workspace
- EXP Existing `Blue` workspace window is focused


## 7. Tab operations

### 7.1 Open tab
- PREQ 1.2
- Open a new tab with `example.com`
- Close the `Green` workspace and open it again
- `example.com` tab exists and is active

### 7.2 Close tab 
- PREQ 7.1
- Close the `example.com` tab
- Close the `Green` workspace and open it again
- `example.com` tab does not exist

### 7.3 Detach tab
- PREQ 7.1
- Detach the `example.com` tab from the `Green` workspace window
- Close the `Green` workspace and open it again
- `example.com` tab is not present in the `Green` workspace window

### 7.4 Attach tab
- PREQ 7.3
- Attach the `example.com` tab from the other window back to the `Green` workspace window
- Close the `Green` workspace and open it again
- `example.com` tab exists and is active

### 7.5 Ungroup tabs
- TBD

### 7.6 Close tab group
- TBD

## 8. Keyboard control

### 8.1 Open list of workspaces
- PREQ 1.3
- Press <kbd>Alt/Option + W</kbd>
- EXP Workspace list is open

### 8.2 Select workspace
- PREQ 8.1
- Press <kbd>Arrow Down</kbd>
- EXP `Green` item is highlighted
- Press <kbd>Enter</kbd>
- EXP `Green` workspace window is focused

### 8.3 Edit workspace
- PREQ 1.2
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

