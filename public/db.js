const { response } = require("express");

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

const compareData = () => {
  const transaction = db.transaction(["pending"], "readwrite");
  const objectStore = transaction.objectStore("pending");
  const getAll = objectStore.getAll();

  const writeToDB = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    };

    const response = await fetch("/api/transaction/bulk", options);

    const dataJSON = (response) => {
      return response.json();
    };

    objectStore.clear();

    return dataJSON;
  };

  const onSuccess = () => {
    if (getAll.result.length > 0) {
      writeToDB();
    }
  };

  getAll.onsuccess = onSuccess();
};

window.addEventListener("online", compareData);
