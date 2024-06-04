"use strict";

let loggedIn = stringToBoolConvertion(localStorage.getItem("loggedIn"));

// json
const getInfo = async () => {
  let request = await fetch("staff_info.txt");
  return await request.json();
};

// IndexedDatabase
const DBRequestUsers = indexedDB.open("usersDB", 1);

// Open DB
DBRequestUsers.addEventListener("upgradeneeded", () => {
  const db = DBRequestUsers.result;
  const store = db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
});

// Succesfull DB open
DBRequestUsers.onsuccess = () => {
  const db = DBRequestUsers.result;

  if (localStorage.getItem("updatedStaffUsers")) {
    console.log("The staff were already updated");
  } else {
    updateStaff();
    localStorage.setItem("updatedStaffUsers", true);
  }

  function getIDBData(mode) {
    const transaction = db.transaction("users", mode);
    const objectStore = transaction.objectStore("users");
    return objectStore;
  }

  function saveUser(user) {
    const objectStore = getIDBData("readwrite");

    const request = objectStore.add(user);
    request.onsuccess = () => {
      console.log("User added");
    };
    request.onerror = () => {
      console.log("There has been an error adding the user to the dataBase");
    };
  }

  function getUsers() {
    return new Promise((resolve, reject) => {
      const objectStore = getIDBData("readonly");

      const request = objectStore.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(new Error("Error obtaining the users"));
      };
    });
  }

  function getUserById(id) {
    return new Promise((resolve, reject) => {
      const objectStore = getIDBData("readonly");

      const request = objectStore.get(id);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(new Error("Error obtaining the users"));
      };
    });
  }

  function updateStaff() {
    getInfo()
      .then((staffInfo) => {
        for (let staffUser of staffInfo) {
          let username = staffUser.username;
          let password = staffUser.password;
          let name = staffUser.name;
          let lastName = staffUser.last_name;
          let email = staffUser.email;
          getStaffPictureFile(staffUser.picture).then((picture) => {
            let user = {
              username: username,
              password: password,
              name: name,
              lastName: lastName,
              email: email,
              picture: picture,
            };
            saveUser(user);
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function checkLogin() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    getUsers().then((usersInfo) => {
      for (let userInfo of usersInfo) {
        let user = userInfo.username;
        let userPassword = userInfo.password;

        if (user == username && password == userPassword) {
          loggedIn = true;
          localStorage.setItem("userId", userInfo.id);
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
          localStorage.setItem("loggedIn", loggedIn);
          welcomeUser(userInfo);
        } else if (user === username && password != userPassword) {
          document.getElementById("error-message").style.display = "block";
        }
      }
    });
  }

  const signupPicture = document.getElementById("signup-picture");
  document
    .getElementById("signup-picture-file")
    .addEventListener("change", (event) => {
      let file = event.target.files[0];

      if (file) {
        let reader = new FileReader();
        reader.onload = function (event) {
          let urlImg = event.target.result;

          const img = document.createElement("img");
          img.src = urlImg;

          signupPicture.innerHTML = "";
          signupPicture.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });

  document
    .getElementById("signup-form-container")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("signup-name").value;
      const lastName = document.getElementById("signup-last-name").value;
      const email = document.getElementById("signup-email").value;
      const picture = document.getElementById("signup-picture-file").files[0];
      const username = document.getElementById("signup-username").value;
      const password = document.getElementById("signup-password").value;
      const repeatedPassword = document.getElementById(
        "signup-password-repeat"
      ).value;

      if (password === repeatedPassword) {
        const newUser = {
          username: username,
          password: password,
          name: name,
          last_name: lastName,
          email: email,
          picture: picture,
        };

        saveUser(newUser);
        document.getElementById("username").value = username;
        document.getElementById("password").value = password;
        checkLogin();
        location.reload();
      } else console.log("the passwords do not match");
    });

  document.getElementById("login-button").addEventListener("click", checkLogin);

  if (loggedIn) {
    const userId = parseInt(localStorage.getItem("userId"));
    getUserById(userId)
      .then((userInfo) => {
        welcomeUser(userInfo);
      })
      .catch((e) => {
        console.log(e);
      });
  }
};

if (!loggedIn) {
  const loginContainer = document.getElementById("login-container");
  const signupContainer = document.getElementById("signup-container");

  const setSignup = () => {
    signupContainer.style.display = "block";
    loginContainer.style.display = "none";
  };

  const setLogin = () => {
    signupContainer.style.display = "none";
    loginContainer.style.display = "block";
  };
  document.getElementById("signup-option-btn").addEventListener("click", () => {
    setSignup();
    window.scrollTo(0, 270);
    localStorage.setItem("showSignUp", true);
  });
  document.getElementById("login-option-btn").addEventListener("click", () => {
    setLogin();
    localStorage.setItem("showSignUp", false);
  });

  const showSignup = localStorage.getItem("showSignUp");
  if (showSignup && stringToBoolConvertion(showSignup)) {
    setSignup();
  } else {
    setLogin();
  }
}

let pageReloading = false;
window.addEventListener("beforeunload", () => {
  pageReloading = true;
});

window.addEventListener("unload", () => {
  if (!pageReloading) localStorage.removeItem("showSignUp");
});

function stringToBoolConvertion(string) {
  let boolStatus;
  if (string == "true") boolStatus = true;
  else boolStatus = false;
  return boolStatus;
}

// Image File reader
function readFileImage(file) {
  if (file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("The file is not an image"));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const imageUrl = event.target.result;
        resolve(imageUrl);
      };

      reader.onerror = () => {
        reject(new Error("Error reading the  file"));
      };
      reader.readAsDataURL(file);
    });
  }
}

function welcomeUser(userInfo) {
  const loginContainer = document.getElementById("login-container");
  loginContainer.style.display = "none";

  const profileContainer = document.getElementById("profile-container");
  const profileImg = document.getElementById("profile-img");

  const profileText = document.getElementById("profile-text");

  profileText.firstElementChild.firstElementChild.innerHTML = userInfo.username;
  profileText.firstElementChild.nextElementSibling.innerHTML = `${userInfo.name} ${userInfo.lastName}`;
  profileText.lastElementChild.innerHTML = userInfo.email;

  readFileImage(userInfo.picture)
    .then((imgUrl) => {
      profileImg.setAttribute("src", imgUrl);
    })
    .catch((error) => {
      console.log(error.message);
    });

  profileContainer.style.display = "block";
  document.getElementById("logout-btn").addEventListener("click", () => {
    loginContainer.style.display = "block";
    profileContainer.style.display = "none";
    loggedIn = false;
    localStorage.setItem("loggedIn", loggedIn);
    location.reload();
  });
}

async function getStaffPictureFile(pictureUrl) {
  try {
    const response = await fetch(pictureUrl);

    // transform the response to a blob object
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        // Transform the base64 response to a blob object
        const imageBase64 = reader.result;
        const file = dataURItoBlob(imageBase64);
        resolve(file);
      };

      reader.onerror = () => {
        reject(new Error("Error getting the staff picture in base64"));
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("error obtaining the image: ", error);
  }
}

///////////////////////////////////////////
function dataURItoBlob(dataURI) {
  const parts = dataURI.split(";base64,");
  const type = parts[0].split(":")[1];
  const byteString = atob(parts[1]);

  const buffer = new ArrayBuffer(byteString.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < byteString.length; i++) {
    view[i] = byteString.charCodeAt(i);
  }

  return new Blob([buffer], { type: type });
}
///////////////////////////////////////////
