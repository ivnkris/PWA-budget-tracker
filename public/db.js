const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
  db = target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
  db = target.result;

  // if app is online, read from database
  if (navigator.onLine) {
    compareData();
  }
};

request.onerror = (event) => {
  console.log("[ERROR!]:", event.target.errorCode);
};

const saveRecord = (record) => {
  const transaction = db.transaction(["pending"], "readwrite");
  const objectStore = transaction.objectStore("pending");

  objectStore.add(record);
};

// write to database if item added
const compareData = () => {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          // delete records if successful
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
};

window.addEventListener("online", compareData);
