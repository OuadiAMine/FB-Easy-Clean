// content.js

// Helper: Send a progress message to the extension.
function sendProgress(msg) {
    chrome.runtime.sendMessage({ type: 'progress', message: msg });
  }
  
  // Utility: Wait for a given number of milliseconds.
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Utility: Poll until predicate() returns an element or timeout occurs.
  function waitForElement(predicate, timeout = 5000, interval = 100) {
    return new Promise(resolve => {
      let elapsed = 0;
      const timer = setInterval(() => {
        const el = predicate();
        if (el) {
          clearInterval(timer);
          resolve(el);
        }
        elapsed += interval;
        if (elapsed >= timeout) {
          clearInterval(timer);
          resolve(null);
        }
      }, interval);
    });
  }
  
  // Utility: Wait until the provided element is removed from the DOM.
  function waitForRemoval(el, timeout = 10000, interval = 200) {
    return new Promise(resolve => {
      let elapsed = 0;
      const timer = setInterval(() => {
        if (!document.body.contains(el)) {
          clearInterval(timer);
          resolve();
        }
        elapsed += interval;
        if (elapsed >= timeout) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  }
  
  async function deletePhotos() {
    sendProgress("Starting photo deletion process...");
    await wait(5000);
    
    while (true) {
      let editButton = Array.from(document.querySelectorAll('div[role="button"][aria-label="Edit"]'))
                        .filter(btn => !btn.innerHTML.includes("OR6SzrfoMFg.png"))[0];
      
      if (!editButton) {
        sendProgress("No more photo edit buttons found. Rechecking...");
        await wait(5000);
        // Re-query after waiting
        editButton = Array.from(document.querySelectorAll('div[role="button"][aria-label="Edit"]'))
                        .filter(btn => !btn.innerHTML.includes("OR6SzrfoMFg.png"))[0];
        if (!editButton) {
          sendProgress("Deletion is over, congratulations!");
          break;
        }
      }
      
      editButton.scrollIntoView({ block: "center" });
      await wait(500);
      
      const parentLink = editButton.closest("a");
      if (parentLink) {
        parentLink.removeAttribute("href");
        sendProgress("Removed href from parent link.");
      }
      
      sendProgress("Processing photo edit button...");
      editButton.click();
      
      let deletePhotoBtn = await waitForElement(() => {
        return Array.from(document.querySelectorAll("span")).find(span => span.textContent.trim() === "Delete photo");
      }, 7000);
      
      if (deletePhotoBtn) {
        deletePhotoBtn.click();
        sendProgress("Clicked 'Delete photo'.");
        
        let confirmDeleteBtn = await waitForElement(() => {
          let deleteBtns = Array.from(document.querySelectorAll("span")).filter(span => span.textContent.trim() === "Delete");
          return deleteBtns.length >= 3 ? deleteBtns[2] : null;
        }, 7000);
        
        if (confirmDeleteBtn) {
          confirmDeleteBtn.click();
          sendProgress("Clicked confirmation 'Delete' for photo.");
        } else {
          sendProgress("Third 'Delete' confirmation button not found.");
        }
      } else {
        sendProgress("'Delete photo' button not found for this edit button.");
      }
      
      sendProgress("Waiting for photo to be removed...");
      await waitForRemoval(editButton, 15000);
      sendProgress("Photo deletion confirmed. Waiting before next...");
      await wait(2000);
    }
    
    sendProgress("Photo deletion process complete.");
  }
  
  
  async function deletePosts() {
    sendProgress("Starting post deletion process...");
    await wait(5000);
    
    while (true) {
      let actionButton = document.querySelector('div[role="button"][aria-label="Actions for this post"]');
      
      if (!actionButton) {
        sendProgress("No more post action buttons found. Rechecking...");
        await wait(5000);
        actionButton = document.querySelector('div[role="button"][aria-label="Actions for this post"]');
        if (!actionButton) {
          sendProgress("Deletion is over, congratulations!");
          break;
        }
      }
      
      actionButton.scrollIntoView({ block: "center" });
      await wait(500);
      
      const parentLink = actionButton.closest("a");
      if (parentLink) {
        parentLink.removeAttribute("href");
        sendProgress("Removed href from parent link.");
      }
      
      sendProgress("Processing post action button...");
      actionButton.click();
      
      let deletePostOption = await waitForElement(() => {
        return Array.from(document.querySelectorAll("span")).find(span => span.textContent.trim() === "Delete post");
      }, 7000);
      
      if (deletePostOption) {
        deletePostOption.click();
        sendProgress("Clicked 'Delete post'.");
      } else {
        sendProgress("'Delete post' option not found.");
      }
      
      let confirmDialog = await waitForElement(() => {
        return document.querySelector('div[aria-label="Permanently delete post?"]');
      }, 7000);
      
      if (confirmDialog) {
        let confirmDeleteButton = await waitForElement(() => {
          return confirmDialog.querySelector('div[aria-label="Delete"]');
        }, 7000);
        
        if (confirmDeleteButton) {
          confirmDeleteButton.click();
          sendProgress("Clicked confirmation 'Delete' for post.");
        } else {
          sendProgress("Confirmation 'Delete' button not found.");
        }
      } else {
        sendProgress("Confirmation dialog not found.");
      }
      
      sendProgress("Waiting for post to be removed...");
      await waitForRemoval(actionButton, 15000);
      sendProgress("Post deletion confirmed. Waiting before next...");
      await wait(2000);
    }
    
    sendProgress("Post deletion process complete.");
  }
  
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "delete_photos") {
      deletePhotos().then(() => sendResponse({ status: "done" }));
      return true;
    } else if (request.action === "delete_posts") {
      deletePosts().then(() => sendResponse({ status: "done" }));
      return true;
    }
  });
  