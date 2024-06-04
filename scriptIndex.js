"use strict";

// Variables
const postsContainer = document.getElementById("posts");
const documentFragment = document.createDocumentFragment();
const date = new Date();

// Staff info
const getStaffInfo = async () => {
  let request = await fetch("staff_info.txt");
  return await request.json();
};

// Logged In
const loggedInValue = localStorage.getItem("loggedIn");
let loggedIn;
if (loggedInValue) loggedIn = stringToBoolConvertion(loggedInValue);
else loggedIn = false;

// Ordered by
let orderByLikes = false;

// IndexedDatabase
const DBRequestArticles = indexedDB.open("ArticlesDB", 1);
const DBRequestUsers = indexedDB.open("usersDB", 1);

// Open DB
DBRequestUsers.addEventListener("upgradeneeded", () => {
  const db = DBRequestUsers.result;
  console.log("aaa");
  db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
});

// Open DB
DBRequestArticles.addEventListener("upgradeneeded", () => {
  const db = DBRequestArticles.result;
  const store = db.createObjectStore("articles", {
    keyPath: "id",
    autoIncrement: true,
  });

  store.createIndex("likesCount", "likes", { unique: false });
  store.createIndex("commentsCount", "comments", { unique: false });
});

async function getUserInfo() {
  return new Promise((resolve, reject) => {
    DBRequestUsers.onsuccess = () => {
      const db = DBRequestUsers.result;
      const userId = parseInt(localStorage.getItem("userId"));
      getUserById(db, userId)
        .then((userInfo) => {
          resolve(userInfo);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    };
    DBRequestUsers.onerror = () => {
      const error = new Error("Error obtaining user info");
      console.log(error);
      reject(error);
    };
  });
}

function getUserById(db, id) {
  return new Promise((resolve, reject) => {
    const objectStore = getIDBUserData(db, "readonly");

    const request = objectStore.get(id);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(new Error("Error obtaining the users"));
    };
  });
}

function getIDBUserData(db, mode) {
  const transaction = db.transaction("users", mode);
  const objectStore = transaction.objectStore("users");
  return objectStore;
}

// Succesfull DB open
DBRequestArticles.onsuccess = () => {
  const db = DBRequestArticles.result;

  // Articles db functions

  function getIDBData(mode) {
    const transaction = db.transaction("articles", mode);
    const objectStore = transaction.objectStore("articles");
    return objectStore;
  }

  function saveArticle(article) {
    return new Promise((resolve, reject) => {
      const objectStore = getIDBData("readwrite");

      const request = objectStore.add(article);
      request.onsuccess = () => {
        console.log("Article saved");
        resolve(request.result);
      };
      request.onerror = () => {
        console.log("There has been an error");
        reject(
          new Error("There was an error adding the article in the DataBase")
        );
      };
    });
  }

  function updateArticle(article, updatedArticle) {
    return new Promise((resolve, reject) => {
      const objectStore = getIDBData("readwrite");

      article.title = updatedArticle.title;
      article.subtitle = updatedArticle.subtitle;
      article.img = updatedArticle.img;
      article.img_width = updatedArticle.img_width;
      article.date = updatedArticle.date;
      article.author = updatedArticle.author;
      article.bodyText = updatedArticle.bodyText;
      article.likes = updatedArticle.likes;
      article.comments = updatedArticle.comments;
      article.topics = updatedArticle.topics;

      console.log(article);

      const request = objectStore.put(article);
      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(
          new Error("There was an error updating the article in the DataBase")
        );
      };
    });
  }

  function deleteArticle(articleID) {
    return new Promise((resolve, reject) => {
      const objectStore = getIDBData("readwrite");

      const request = objectStore.delete(parseInt(articleID));

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(
          new Error("There was an error deleting the article in the database")
        );
      };
    });
  }

  function getArticles() {
    return new Promise((resolve, reject) => {
      const objectStore = getIDBData("readonly");

      const request = objectStore.getAll();
      request.onsuccess = () => {
        const articles = request.result;
        resolve(articles);
      };
      request.onerror = () => {
        reject(new Error("Error obtaining the articles"));
      };
    });
  }

  function getArticleById(id) {
    return new Promise((resolve, reject) => {
      let objectStore = getIDBData("readonly");
      const request = objectStore.get(parseInt(id));
      request.onsuccess = () => {
        const article = request.result;
        resolve(article);
      };
      request.onerror = () => {
        reject(new Error("The ID doesnt match with any article"));
      };
    });
  }

  function updateArticleLikes(article, newLikes) {
    return new Promise((resolve, reject) => {
      let objectStore = getIDBData("readwrite");
      article.likes = newLikes;
      const request = objectStore.put(article);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(new Error("There was an error updating the article likes"));
      };
    });
  }

  function updateArticleComments(article, newComment) {
    return new Promise((resolve, reject) => {
      let objectStore = getIDBData("readwrite");
      console.log(article);
      console.log(article.comments);
      article.comments.push(newComment);
      const request = objectStore.put(article);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(new Error("There was an error updating the article comment"));
      };
    });
  }

  const getArticlesInfo = async () => {
    let request = await fetch("preloaded_articles.txt");
    return await request.json();
  };

  //////////////////////////////////////////////
  async function getArticlePictureFile(pictureUrl, fileName) {
    try {
      const response = await fetch(pictureUrl);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const imageBase64 = reader.result;
          const file = dataURItoFile(imageBase64, fileName);
          resolve(file);
        };

        reader.onerror = () => {
          reject(new Error("Error getting the article picture in base64"));
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error obtaining the image:", error);
      throw error; // Re-lanza el error para que pueda ser manejado externamente
    }
  }

  function dataURItoFile(dataURI, fileName) {
    const parts = dataURI.split(";base64,");
    const type = parts[0].split(":")[1];
    const byteString = atob(parts[1]);

    const buffer = new ArrayBuffer(byteString.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < byteString.length; i++) {
      view[i] = byteString.charCodeAt(i);
    }

    // Crear y devolver un objeto File en lugar de Blob
    return new File([buffer], fileName, { type: type });
  }
  ////////////////////////////////////////////////////

  function addPreloadedArticles() {
    getArticlesInfo()
      .then((articlesInfo) => {
        for (const articleData of articlesInfo) {
          const title = articleData.title;
          const subtitle = articleData.subtitle;
          const imgPath = articleData.img;
          const imgWidth = articleData.img_width;
          const date = articleData.date;
          const bodyText = getPreloadedParagraphs(articleData.bodyText);
          const author = articleData.author;
          const likes = articleData.likes;
          const comments = verifyEmptyComments(articleData.comments);
          const topics = articleData.topics.split(",");

          getArticlePictureFile(imgPath, title).then((img) => {
            console.log(img);
            const article = {
              title: title,
              subtitle: subtitle,
              img: img,
              img_width: imgWidth,
              date: date,
              author: author,
              bodyText: bodyText,
              likes: likes,
              comments: comments,
              topics: topics,
            };
            saveArticle(article).then((art) => {
              console.log(art);
            });
          });
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  if (localStorage.getItem("preloadedArticlesAdded")) {
    console.log("The articles were already updated");
  } else {
    addPreloadedArticles();
    localStorage.setItem("preloadedArticlesAdded", true);
    location.reload();
  }

  //////////////////////////////////////////////////////////////

  // If the user is logged
  if (loggedIn) {
    console.log("a");
    getUserInfo()
      .then((userInfo) => {
        getArticles()
          .then((articles) => {
            articles = orderArticlesByDate(articles, true);
            for (let articleData of articles) {
              const article = createArticle(articleData, userInfo);
              documentFragment.appendChild(article);
            }
            postsContainer.appendChild(documentFragment);

            getStaffInfo().then((staffInfo) => {
              for (let staffUser of staffInfo) {
                if (
                  userInfo.username === staffUser.username &&
                  userInfo.password === staffUser.password
                ) {
                  let createArticleBtn = createNewArticleButton();

                  const modalBackground =
                    document.getElementById("modal-background");
                  const newArticleModal =
                    document.getElementById("new-article-modal");

                  // New article form
                  createArticleBtn.addEventListener("click", function () {
                    showNewArticleContainer(modalBackground, newArticleModal);
                  });

                  modalBackground.addEventListener("click", function () {
                    modalBackground.style.display = "none";
                    newArticleModal.style.display = "none";

                    if (localStorage.getItem("articleInModification")) {
                      localStorage.setItem("articleInModification", false);
                      localStorage.setItem("articleInModificationId", 0);
                    }
                  });

                  const newArtImgFile = document.getElementById(
                    "new-article-img-file"
                  );
                  const newArtImage =
                    document.getElementById("new-article-img");
                  const increaseImgWidth =
                    document.getElementById("increase-img-width");
                  const reduceImgWidth =
                    document.getElementById("reduce-img-width");

                  // Select an image
                  newArtImgFile.addEventListener("change", function (event) {
                    let file = event.target.files[0];

                    if (file) {
                      let reader = new FileReader();
                      reader.onload = function (event) {
                        let urlImg = event.target.result;

                        const img = document.createElement("img");
                        img.src = urlImg;
                        img.width = 300;

                        newArtImage.innerHTML = "";
                        newArtImage.appendChild(img);

                        increaseImgWidth.style.display = "inline-block";
                        reduceImgWidth.style.display = "inline-block";

                        increaseImgWidth.addEventListener("click", function () {
                          if (img.width < 350) img.width += 25;
                          localStorage.setItem("artImgWidth", img.width);
                        });

                        reduceImgWidth.addEventListener("click", function () {
                          if (img.width > 200) img.width -= 25;
                          localStorage.setItem("artImgWidth", img.width);
                        });

                        localStorage.setItem("artImgWidth", img.width);
                      };
                      reader.readAsDataURL(file);
                    }
                  });

                  // Publish new article
                  const publishNewArticleBtn = document.getElementById(
                    "publish-new-article-btn"
                  );
                  publishNewArticleBtn.addEventListener("click", () => {
                    const title =
                      document.getElementById("new-article-title").value;
                    const subtitle = document.getElementById(
                      "new-article-subtitle"
                    ).value;
                    const img = document.getElementById("new-article-img-file")
                      .files[0];
                    const imgWidth = localStorage.getItem("artImgWidth");
                    const date = getCompleteDate();
                    const author = `${userInfo.name} ${userInfo.lastName}`;
                    const bodyText = getParagraphs(
                      document.getElementById("new-article-body").value
                    );
                    const topics = getNewArticleTopics();
                    const commentsList = [];

                    console.log(img);
                    console.log(bodyText);
                    console.log(topics);

                    if (
                      title !== "" &&
                      subtitle !== "" &&
                      img !== undefined &&
                      bodyText !== "" &&
                      topics !== ""
                    ) {
                      const newArticleJSON = {
                        //cambiarle el nombre a todos estos que dicen "new" ya que se comparten con modificar
                        title: title,
                        subtitle: subtitle,
                        img: img,
                        img_width: imgWidth,
                        date: date,
                        author: author,
                        bodyText: bodyText,
                        likes: 0,
                        comments: commentsList,
                        topics: topics,
                      };

                      if (
                        localStorage.getItem("articleInModification") &&
                        stringToBoolConvertion(
                          localStorage.getItem("articleInModification")
                        )
                      ) {
                        const articleId = localStorage.getItem(
                          "articleInModificationId"
                        );

                        getArticleById(articleId).then((article) => {
                          newArticleJSON.likes = article.likes;
                          newArticleJSON.comments = article.comments;
                          updateArticle(article, newArticleJSON);
                        });
                      } else {
                        saveArticle(newArticleJSON).then((art) => {
                          console.log(art);
                        });
                      }
                      // location.reload();
                      modalBackground.style.display = "none";
                      newArticleModal.style.display = "none";
                    } else {
                      document.getElementById(
                        "new-art-incompleted-msg"
                      ).style.display = "block";
                    }
                  });

                  // delete article
                  const deleteArticleBtn =
                    document.getElementById("delete-article-btn");
                  deleteArticleBtn.addEventListener("click", () => {
                    if (
                      confirm(
                        "Are you sure you want to delete this Article?\nIt will be lost forever"
                      )
                    ) {
                      deleteArticle(
                        localStorage.getItem("articleInModificationId")
                      );
                      location.reload();
                      window.scrollTo(0, 0);
                    }
                  });

                  const newTopicButton =
                    document.getElementById("new-topic-btn");
                  const newTopicContainer = document.getElementById(
                    "new-topic-container"
                  );

                  newTopicButton.addEventListener("click", () => {
                    newTopicButton.style.display = "none";
                    newTopicContainer.style.display = "block";
                  });

                  newTopicContainer.lastElementChild.addEventListener(
                    "click",
                    () => {
                      const topicInput =
                        document.getElementById("new-topic-input");
                      const topic = topicInput.value;

                      const divNewTopic = document.createElement("div");
                      divNewTopic.classList.add("new-topic");

                      // esto se puede hacer una funcion porque lo llamo en dos lados ditintos igual
                      const topicLabel = document.createElement("label");
                      const deleteTopicBtn = document.createElement("button");

                      topicLabel.innerHTML = topic;
                      deleteTopicBtn.innerHTML = "X";
                      deleteTopicBtn.classList.add("delete-topic-btn");
                      deleteTopicBtn.setAttribute("type", "button");

                      divNewTopic.appendChild(topicLabel);
                      divNewTopic.appendChild(deleteTopicBtn);

                      document
                        .getElementById("new-article-topics")
                        .appendChild(divNewTopic);
                      //////////////////

                      topicInput.value = "";
                      newTopicButton.style.display = "block";
                      newTopicContainer.style.display = "none";

                      deleteTopic();
                    }
                  );
                }
              }
            });

            getLikes(userInfo);
            verifyCommentButtons("block", userInfo);
            getArticleEdits();
            setPopularTopics(articles, userInfo);
            getSort(userInfo);
          })
          .catch((e) => {
            console.log(e);
          });
        // Get articles
      })
      .catch((e) => {
        console.log(e);
      });
    // get UserInfo
  } else {
    getArticles()
      .then((articles) => {
        articles = orderArticlesByDate(articles, true);
        for (let articleData of articles) {
          const article = createArticle(articleData);

          documentFragment.appendChild(article);
        }
        postsContainer.appendChild(documentFragment);

        verifyCommentButtons("none");
        setPopularTopics(articles);
        getSort(articles);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  window.onscroll = function () {
    stickNavBar();
  };

  const navbar = document.getElementById("navbar");
  const sidebar = document.getElementById("sidebar");
  const bars = document.getElementById("bars");

  let sticky = navbar.offsetTop;

  function stickNavBar() {
    if (window.pageYOffset >= sticky) {
      bars.classList.add("sticky");
    } else {
      bars.classList.remove("sticky");
    }
  }

  document.getElementById("sidebar-btn").addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  //functions

  function getLikes(userInfo) {
    // Give like to a Document
    const likeButtons = document.querySelectorAll(".like-button");
    for (let button of likeButtons) {
      button.addEventListener("click", () => {
        const likeCount = button.nextElementSibling;
        let buttonPostID = getParentElement(button, 4).id;
        let currentLikes = parseInt(likeCount.textContent);

        // getLikesFromArticleId(buttonPostID).then(currentLikes=> {
        console.log(currentLikes);

        let clickedState = localStorage.getItem(
          `clickedStateButton${buttonPostID}${userInfo.username}`
        );
        let clicked;
        if (clickedState) clicked = stringToBoolConvertion(clickedState);
        else clicked = false;

        getArticleById(buttonPostID)
          .then((buttonArticle) => {
            console.log(buttonArticle);
            if (!clicked) {
              button.innerHTML = `<i class="fa-solid fa-heart"></i>`;
              currentLikes++;
              clicked = true;
            } else {
              button.innerHTML = `<i class="fa-regular fa-heart"></i>`;
              currentLikes--;
              clicked = false;
            }
            likeCount.textContent = currentLikes;
            updateArticleLikes(buttonArticle, currentLikes)
              .then((smt) => {
                console.log("Succesfull like update");
                localStorage.setItem(
                  `clickedStateButton${buttonPostID}${userInfo.username}`,
                  clicked
                );
              })
              .catch((e) => {
                console.log(e);
              });
          })
          .catch((e) => {
            console.log(e);
          });
        // }).catch(e =>{
        //     console.log(e);
        // })
      });
    }
  }

  ////////////

  function verifyCommentButtons(display, userInfo = {}) {
    const commentButtons = document.querySelectorAll(".comment-button");

    for (let button of commentButtons) {
      let clicked = false;
      button.addEventListener("click", () => {
        let buttonArticleComments = getParentElement(
          button,
          2
        ).nextElementSibling;
        if (!clicked) {
          button.innerHTML = `<i class="fa-solid fa-comment"></i>`;
          buttonArticleComments.style.display = "block";

          const newArticleComment = buttonArticleComments.firstElementChild;
          newArticleComment.style.display = display;

          clicked = true;
        } else {
          buttonArticleComments.style.display = "none";
          button.innerHTML = `<i class="fa-regular fa-comment"></i>`;
          clicked = false;
        }
      });
    }

    ///////////// (change the func name)
    //////////// (Second part)

    const cancelCommentButtons = document.querySelectorAll(
      ".new-art-cancel-btn"
    );
    for (let button of cancelCommentButtons) {
      const articleID = getParentElement(button, 5);

      button.addEventListener("click", () => {
        const commentElement = getParentElement(button, 1)
          .previousElementSibling.lastElementChild;
        commentElement.value = "";
      });
    }

    if (loggedIn) {
      // Save new Comment
      const confirmCommentButtons = document.querySelectorAll(
        ".new-art-comment-btn"
      );

      for (let button of confirmCommentButtons) {
        const articleId = getParentElement(button, 5).id;
        button.addEventListener("click", () => {
          const commentElement = getParentElement(button, 1)
            .previousElementSibling.lastElementChild;
          const comment = commentElement.value;

          if (comment.length > 0) {
            const username = userInfo.username;
            const completeDate = getCompleteDate();
            console.log(userInfo.picture);
            const picture = userInfo.picture;
            console.log(picture);

            const newComment = {
              username: username,
              date: completeDate,
              picture: picture,
              comment: comment,
            };
            console.log(articleId);

            getArticleById(articleId)
              .then((buttonArticle) => {
                updateArticleComments(buttonArticle, newComment)
                  .then(() => {
                    const divArticleComments = getParentElement(
                      commentElement,
                      3
                    ).lastElementChild;
                    const divArticleComment = createCommment(newComment);

                    divArticleComments.appendChild(divArticleComment);
                    commentElement.value = "";
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              })
              .catch((e) => {
                console.log(e);
              });
          }
        });
        // event click
      }
    }
  }

  function getArticleEdits() {
    const editArtBtns = document.querySelectorAll(".edit-article-btn");

    for (let editBtn of editArtBtns) {
      editBtn.addEventListener("click", () => {
        const btnId = getParentElement(editBtn, 3).id;

        getArticleById(btnId).then((article) => {
          const modalBackground = document.getElementById("modal-background");
          const editArticleModal = document.getElementById("new-article-modal");

          localStorage.setItem("articleInModification", true);
          localStorage.setItem("articleInModificationId", btnId);

          showEditArticleContainer(modalBackground, editArticleModal, article);
        });
      });
    }

    window.addEventListener("beforeunload", function (event) {
      if (localStorage.getItem("articleInModification")) {
        localStorage.setItem("articleInModification", false);
        localStorage.setItem("articleInModificationId", 0);
      }
    });
  }

  function getNewArticleTopics() {
    const topicsList = [];
    const topicDivs = document.querySelectorAll(".new-topic");
    for (const topicDiv of topicDivs) {
      const topic = topicDiv.firstElementChild.innerHTML;
      topicsList.push(topic);
    }
    return topicsList;
  }

  function setPopularTopics(articles, userInfo = {}) {
    let topicsList = [];
    for (const article of articles) {
      const topics = article.topics;
      for (let topic of topics) {
        topicsList.push(topic);
      }
    }
    const popularTopicsSidebar = document.getElementById("popular-topics");

    let orderedTopics = findMostRepeatedElements(topicsList);
    for (let topic in orderedTopics) {
      const topicButton = document.createElement("button");
      topicButton.classList.add("featured-topic");
      topicButton.innerHTML = topic;

      popularTopicsSidebar.appendChild(topicButton);
    }

    const featuredTopics = document.querySelectorAll(".featured-topic");

    for (let fTopic of featuredTopics) {
      fTopic.addEventListener("click", () => {
        getArticlesByTopic(articles, fTopic.innerHTML, userInfo);
        document.getElementById("sidebar").classList.remove("active");
        if (loggedIn) {
          getLikes(userInfo);
          verifyCommentButtons("block", userInfo);
          getArticleEdits();
        } else {
          verifyCommentButtons("none");
        }
      });
    }
  }

  function findMostRepeatedElements(array) {
    let counter = {};

    for (let element of array) {
      counter[element] = (counter[element] || 0) + 1;
    }

    let elementCounterList = Object.entries(counter);
    elementCounterList.sort((a, b) => b[1] - a[1]);

    let topElements = elementCounterList.slice(0, 5);
    let topicCounerPair = {};

    for (let element of topElements) {
      topicCounerPair[element[0]] = element[1];
    }
    return topicCounerPair;
  }

  function getArticlesByTopic(articles, topic, userInfo) {
    let topicArticles = [];

    for (let article of articles) {
      let articleTopics = article.topics;

      for (let artTopic of articleTopics) {
        if (artTopic.toLowerCase() === topic.toLowerCase()) {
          topicArticles.push(article);
        }
      }
    }
    cleanArticles();
    if (topicArticles.length > 0) {
      for (let articleData of topicArticles) {
        const article = createArticle(articleData, userInfo);
        documentFragment.appendChild(article);
      }
      postsContainer.appendChild(documentFragment);
    }
  }

  function cleanArticles() {
    while (postsContainer.firstChild) {
      postsContainer.removeChild(postsContainer.firstChild);
    }
  }

  function getSort(userInfo = {}) {
    const ascArtBtn = document.getElementById("asc-article-btn");
    const descArtBtn = document.getElementById("desc-article-btn");

    document.getElementById("sort-by-date").addEventListener("click", () => {
      orderByLikes = false;
      sortBy(userInfo);

      ascArtBtn.innerHTML = "Least recent";
      descArtBtn.innerHTML = "Most recent";
    });
    document.getElementById("sort-by-like").addEventListener("click", () => {
      orderByLikes = true;
      sortBy(userInfo);

      ascArtBtn.innerHTML = "Least liked";
      descArtBtn.innerHTML = "Most liked";
    });
    ascArtBtn.addEventListener("click", () => {
      sortBy(userInfo, true);
    });
    descArtBtn.addEventListener("click", () => {
      sortBy(userInfo);
    });
  }

  function orderArticlesByLikes(articles, asc) {
    if (asc) {
      return articles.sort((a, b) => a.likes - b.likes);
    }
    return articles.sort((a, b) => b.likes - a.likes);
  }

  function orderArticlesByDate(articles, asc) {
    console.log("aa");
    if (asc) return articles.sort(sortDatesAsc);
    return articles.sort(sortDatesDesc);
  }

  function sortDatesDesc(a, b) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  }

  function sortDatesAsc(a, b) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  }

  function sortBy(userInfo, asc = false) {
    getArticles().then((articles) => {
      let sortedArticles;

      if (orderByLikes) {
        sortedArticles = orderArticlesByLikes(articles, asc);
      } else {
        sortedArticles = orderArticlesByDate(articles, asc);
      }

      cleanArticles();
      for (let articleData of sortedArticles) {
        const article = createArticle(articleData, userInfo);
        documentFragment.appendChild(article);
      }
      postsContainer.appendChild(documentFragment);

      if (loggedIn) {
        getLikes(userInfo);
        verifyCommentButtons("block", userInfo);
        getArticleEdits();
      } else {
        verifyCommentButtons("none");
      }
    });
  }
};

// Articles creation
function createHeader(title, subtitle, image, imgWidth, author, userInfo) {
  const header = document.createElement("HEADER");
  header.classList.add("heading");

  if (author === `${userInfo.name} ${userInfo.lastName}`) {
    const divEditButton = document.createElement("div");
    const editButton = document.createElement("button");
    editButton.setAttribute("type", "button");
    editButton.classList.add("edit-article-btn");
    editButton.innerHTML = "Edit";

    divEditButton.appendChild(editButton);
    header.appendChild(divEditButton);
  }

  const imgLogo = document.createElement("IMG");
  imgLogo.classList.add("logo-head");
  imgLogo.setAttribute("src", "img/bugle_logo.jpg");
  imgLogo.setAttribute("width", "500");
  imgLogo.setAttribute("alt", "Bugle image");

  const h2 = document.createElement("H2");
  h2.classList.add("title");

  const p = document.createElement("P");
  p.classList.add("subtitle");

  const imgPost = document.createElement("IMG");
  imgPost.classList.add("post-photo");
  readFileImage(image)
    .then((imgUrl) => {
      imgPost.setAttribute("src", imgUrl);
    })
    .catch((error) => {
      console.log(error.message);
    });
  imgPost.setAttribute("width", imgWidth * 1.5);
  imgPost.setAttribute("alt", "article image");

  header.appendChild(imgLogo);
  header.appendChild(h2);
  header.appendChild(p);
  header.appendChild(imgPost);

  const textTitle = document.createTextNode(title);
  const textSubtitle = document.createTextNode(subtitle);

  h2.appendChild(textTitle);
  p.appendChild(textSubtitle);

  return header;
}

function createSection(date, author, bodyText) {
  const articleAuthor = author;

  const section = document.createElement("SECTION");
  section.classList.add("post-content");

  const divWritter = document.createElement("DIV");
  divWritter.classList.add("post-writter");

  const divDate = document.createElement("DIV");
  divDate.classList.add("post-date");

  const pWritter = document.createElement("P");
  const textWritter = document.createTextNode(`Written by: ${articleAuthor}`);
  pWritter.appendChild(textWritter);

  const pDate = document.createElement("P");
  const textDate = document.createTextNode(getCompleteDateFormat(date));
  pDate.appendChild(textDate);

  divDate.appendChild(pDate);
  divWritter.appendChild(divDate);
  divWritter.appendChild(pWritter);

  section.appendChild(divWritter);

  const divBody = document.createElement("DIV");

  for (let paragraph of bodyText) {
    const divParagraph = document.createElement("DIV");
    const pParagraph = document.createElement("P");

    const textParagraph = document.createTextNode(paragraph);
    pParagraph.appendChild(textParagraph);
    divParagraph.appendChild(pParagraph);
    divBody.appendChild(divParagraph);
  }

  section.appendChild(divBody);

  return section;
}

function createCommment(comment) {
  const divArticleComment = document.createElement("div");
  divArticleComment.classList.add("article-comment");

  const imgArticleComment = document.createElement("img");
  readFileImage(comment.picture).then((imgUrl) => {
    imgArticleComment.src = imgUrl;
  });

  const divArticleCommentText = document.createElement("div");
  divArticleCommentText.classList.add("article-comment-text");

  const divCommentUserData = document.createElement("div");
  divCommentUserData.classList.add("comment-user-data");

  const pCommentUsername = document.createElement("p");
  const bCommentUsername = document.createElement("b");
  bCommentUsername.innerHTML = comment.username;

  pCommentUsername.appendChild(bCommentUsername);

  const pCommentDate = document.createElement("p");
  pCommentDate.innerHTML = getDateDifference(comment.date);

  divCommentUserData.appendChild(pCommentUsername);
  divCommentUserData.appendChild(pCommentDate);

  const divCommentUserText = document.createElement("div");
  divCommentUserText.classList.add("comment-user-text");

  const pCommentUserText = document.createElement("p");
  pCommentUserText.innerHTML = comment.comment;

  divCommentUserText.appendChild(pCommentUserText);

  divArticleCommentText.appendChild(divCommentUserData);
  divArticleCommentText.appendChild(divCommentUserText);

  divArticleComment.appendChild(imgArticleComment);
  divArticleComment.appendChild(divArticleCommentText);

  return divArticleComment;
}

function createFooter(id, topics, likes, comments, userInfo) {
  const footer = document.createElement("footer");
  footer.classList.add("article-footer");

  const divTopics = document.createElement("div");
  divTopics.classList.add("article-topics");

  for (const topic of topics) {
    const pTopics = document.createElement("p");
    const textTopics = document.createTextNode(`#${topic}`);
    pTopics.appendChild(textTopics);
    divTopics.appendChild(pTopics);
  }
  footer.appendChild(divTopics);

  const divButtonContainer = document.createElement("div");
  divButtonContainer.classList.add("buttons-container");

  for (let i = 0; i < 2; i++) {
    let buttonType;
    let iclassIconType;
    let iclassIcon;
    let count;
    if (i == 0) {
      buttonType = "like";
      if (
        stringToBoolConvertion(
          localStorage.getItem(`clickedStateButton${id}${userInfo.username}`)
        )
      )
        iclassIconType = "fa-solid";
      else iclassIconType = "fa-regular";

      iclassIcon = "fa-heart";
      count = likes;
    } else {
      buttonType = "comment";
      iclassIconType = "fa-regular";
      iclassIcon = "fa-comment";
      count = comments.length;
    }

    const divButtonWrapper = document.createElement("div");
    divButtonWrapper.classList.add("button-wrapper");

    const button = document.createElement("button");
    button.classList.add(`${buttonType}-button`);
    button.setAttribute("type", "button");

    const iButton = document.createElement("i");
    iButton.classList.add(iclassIconType);
    iButton.classList.add(iclassIcon);

    const pCount = document.createElement("p");
    pCount.classList.add(`${buttonType}-count`);
    const textCount = document.createTextNode(count);

    pCount.appendChild(textCount);
    button.appendChild(iButton);
    divButtonWrapper.append(button);
    divButtonWrapper.append(pCount);
    divButtonContainer.appendChild(divButtonWrapper);
  }

  const divArticleCommentSection = document.createElement("div");
  divArticleCommentSection.classList.add("article-comment-section");

  const divNewArticleComment = document.createElement("div");
  divNewArticleComment.classList.add("new-article-comment");

  const divTextArticleComment = document.createElement("div");
  divTextArticleComment.classList.add("text-article-comment");

  if (loggedIn) {
    const imgNewCommentUser = document.createElement("img");
    readFileImage(userInfo.picture)
      .then((imgUrl) => {
        imgNewCommentUser.src = imgUrl;
      })
      .catch((error) => {
        console.log(error.message);
      });
    divTextArticleComment.appendChild(imgNewCommentUser);
  }

  const textAreaNewComment = document.createElement("textarea");
  textAreaNewComment.placeholder = "Add a comment...";
  textAreaNewComment.name = "comment-text";

  divTextArticleComment.appendChild(textAreaNewComment);

  const divButtonsArticleNewComment = document.createElement("div");
  divButtonsArticleNewComment.classList.add("buttons-article-comment");

  const cancelButton = document.createElement("button");
  cancelButton.classList.add("new-art-cancel-btn");
  cancelButton.type = "button";
  cancelButton.innerHTML = "Cancel";

  const commentButton = document.createElement("button");
  commentButton.classList.add("new-art-comment-btn");
  commentButton.type = "button";
  commentButton.innerHTML = "Comment";

  divButtonsArticleNewComment.appendChild(cancelButton);
  divButtonsArticleNewComment.appendChild(commentButton);

  divNewArticleComment.appendChild(divTextArticleComment);
  divNewArticleComment.appendChild(divButtonsArticleNewComment);

  const divArticleComments = document.createElement("div");
  divArticleComments.classList.add("article-comments");

  for (let comment of comments) {
    const divArticleComment = createCommment(comment);
    divArticleComments.appendChild(divArticleComment);
  }

  divArticleCommentSection.appendChild(divNewArticleComment);
  divArticleCommentSection.appendChild(divArticleComments);

  footer.appendChild(divButtonContainer);
  footer.appendChild(divArticleCommentSection);

  return footer;
}

function createArticle(articleData, userInfo = {}) {
  const id = articleData.id;
  const title = articleData.title;
  const subtitle = articleData.subtitle;
  const img = articleData.img;
  const imgWidth = parseInt(articleData.img_width);
  const date = articleData.date;
  const author = articleData.author;
  const body = articleData.bodyText;
  const likes = articleData.likes;
  const comments = articleData.comments;
  const topics = articleData.topics;

  const article = document.createElement("article");
  article.classList.add("post");
  article.id = id;

  const header = createHeader(title, subtitle, img, imgWidth, author, userInfo);
  article.appendChild(header);

  const section = createSection(date, author, body);
  article.appendChild(section);

  const footer = createFooter(id, topics, likes, comments, userInfo);
  article.appendChild(footer);

  return article;
}

function getParagraphs(text) {
  let paragraphs = text.split("\n");

  paragraphs = paragraphs.filter((paragraph) => {
    return paragraph.trim() !== "";
  });

  return paragraphs;
}

function getPreloadedParagraphs(text) {
  let paragraphs = text.split("$$$");
  return paragraphs;
}

function verifyEmptyComments(comments) {
  if (comments === "" || comments === 0) {
    return [];
  }
  return comments;
}

// function formatTextAreas(TextAreaList){

// }

// New articles creation documents/ implementation
function createNewArticleButton() {
  let createArticleBtn = document.createElement("button");
  let createArticleDiv = document.getElementById("new-article-button-div");
  createArticleBtn.setAttribute("id", "create-article-button");
  createArticleBtn.setAttribute("type", "button");

  createArticleDiv.appendChild(createArticleBtn);
  const botonText = document.createTextNode(`New Article`);
  createArticleBtn.appendChild(botonText);

  return createArticleBtn;
}

function showNewArticleContainer(modalBackground, newArticleModal) {
  modalBackground.style.display = "block";
  newArticleModal.style.display = "block";
  document.getElementById("delete-article-btn").style.display = "none";

  const newArticleTitle = document.getElementById("new-article-title");
  const newArticleSubtitle = document.getElementById("new-article-subtitle");
  const newArticleBody = document.getElementById("new-article-body");
  const newArticleImgContainer = document.getElementById("new-article-img");

  newArticleTitle.value = "";
  newArticleSubtitle.value = "";
  newArticleBody.value = "";
  newArticleImgContainer.innerHTML = "";

  applyTextAreaStyle(newArticleTitle);
  applyTextAreaStyle(newArticleSubtitle);

  document.getElementById(
    "new-article-date"
  ).innerHTML = `${getCompleteDateFormat(getCompleteDate())}`;

  document.getElementById("new-art-incompleted-msg").style.display = "none";
  document.getElementById("edit-art-incompleted-msg").style.display = "none";
}

function deleteTopic() {
  const deleteTopicButtons = document.querySelectorAll(".delete-topic-btn");
  for (let deleteBtn of deleteTopicButtons) {
    deleteBtn.addEventListener("click", () => {
      getParentElement(deleteBtn, 1).remove();
    });
  }
}

function showEditArticleContainer(modalBackground, editArticleModal, article) {
  modalBackground.style.display = "block";
  editArticleModal.style.display = "block";
  document.getElementById("delete-article-btn").style.display = "block";

  const editArticleTitle = document.getElementById("new-article-title");
  const editArticleSubtitle = document.getElementById("new-article-subtitle");
  const editArticleImgContainer = document.getElementById("new-article-img");
  const editArticleDate = document.getElementById("new-article-date");
  const editArticleBody = document.getElementById("new-article-body");
  const editArticleTopicsContainer =
    document.getElementById("new-article-topics");

  editArticleImgContainer.innerHTML = "";
  editArticleTopicsContainer.innerHTML = "";

  document.getElementById("new-art-incompleted-msg").style.display = "none";
  document.getElementById("edit-art-incompleted-msg").style.display = "none";

  const title = article.title;
  const subtitle = article.subtitle;
  const img = article.img;
  const imgWidth = article.img_width;
  const date = getCompleteDateFormat(article.date);
  const body = article.bodyText.join("\n");
  const topics = article.topics;

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(img);
  const fileList = dataTransfer.files;

  editArticleTitle.value = title;
  editArticleSubtitle.value = subtitle;

  const editArticleImg = document.createElement("img");
  readFileImage(img)
    .then((imgUrl) => {
      editArticleImg.setAttribute("src", imgUrl);
    })
    .catch((error) => {
      console.log(error.message);
    });

  document.getElementById("new-article-img-file").files = fileList;

  // esta bien, ahora le tengo que eliminar el centenar de cosas que cree para arreglarlo,

  editArticleImg.setAttribute("width", imgWidth);
  editArticleImg.setAttribute("alt", "article edit image");
  editArticleImgContainer.appendChild(editArticleImg);
  editArticleDate.innerHTML = date;
  editArticleBody.value = body;
  for (let topic of topics) {
    const divNewTopic = document.createElement("div");
    divNewTopic.classList.add("new-topic");

    const labelNewTopic = document.createElement("label");
    labelNewTopic.innerHTML = topic;

    const deleteTopic = document.createElement("button");
    deleteTopic.innerHTML = "X";
    deleteTopic.classList.add("delete-topic-btn");
    deleteTopic.setAttribute("type", "button");

    divNewTopic.appendChild(labelNewTopic);
    divNewTopic.appendChild(deleteTopic);
    editArticleTopicsContainer.appendChild(divNewTopic);
  }

  deleteTopic();

  document.getElementById("publish-new-article-btn").innerHTML = "Save changes";
}

// Usefull functions
////////////////////////////////////////////////////////

// convertion
function stringToBoolConvertion(string) {
  let boolStatus;
  if (string == "true") boolStatus = true;
  else boolStatus = false;
  return boolStatus;
}

// Image reader
function readImage(imageFile) {
  let file = imageFile.target.files[0];

  if (file) {
    let reader = new FileReader();
    reader.onload = function (imageFile) {
      let urlImg = imageFile.target.result;

      const img = document.createElement("img");
      img.src = urlImg;
      img.width = 300;
    };
    reader.readAsDataURL(file);
  }
}

// Image File reader
const readFileImage = (file) => {
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
};

// Text area styles
const applyTextAreaStyle = (textarea) => {
  textarea.addEventListener("input", function () {
    if (this.value.length > 31) {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    }
  });
};

// Date format
const getCompleteDateFormat = (dateString) => {
  const date = new Date(dateString);
  let suffix;
  let day = date.getDate();

  if (day === 1 || day === 21 || day === 31) {
    suffix = "st";
  } else if (day === 2 || day === 22) {
    suffix = "nd";
  } else if (date === 3 || day === 23) {
    suffix = "rd";
  } else {
    suffix = "th";
  }

  const completeDate = `${
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }) + suffix
  } ${date.getFullYear()}`;

  return completeDate;
};

const getCompleteDate = () => {
  return `${date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })}`;
};

const getDateDifference = (dateString) => {
  const initialdate = new Date(dateString);
  const actualDate = new Date(getCompleteDate());

  const milisDifference = actualDate - initialdate;
  const minutesDifference = Math.floor(milisDifference / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);
  const weeksDifference = Math.floor(daysDifference / 7);
  const monthsDifference = Math.floor(weeksDifference / 30);
  const yearsDifference = Math.floor(monthsDifference / 12);

  const dateFormat = (dateDifference, dateType) => {
    let dateFormat;
    if (dateDifference === 1) dateFormat = `1 ${dateType} ago`;
    else dateFormat = `${dateDifference} ${dateType}s ago`;

    return dateFormat;
  };

  let dateDiffference;
  if (yearsDifference > 0) {
    dateDiffference = dateFormat(yearsDifference, "year");
  } else if (monthsDifference > 0) {
    dateDiffference = dateFormat(monthsDifference, "month");
  } else if (weeksDifference > 0) {
    dateDiffference = dateFormat(weeksDifference, "week");
  } else if (daysDifference > 0) {
    dateDiffference = dateFormat(daysDifference, "day");
  } else if (hoursDifference > 0) {
    dateDiffference = dateFormat(hoursDifference, "hour");
  } else if (minutesDifference > 0) {
    dateDiffference = dateFormat(minutesDifference, "minute");
  } else {
    dateDiffference = `A few seconds ago`;
  }

  return dateDiffference;
};

const getParentElement = (element, timesFather) => {
  for (let i = 0; i < timesFather; i++) {
    element = element.parentNode;
  }
  return element;
};
