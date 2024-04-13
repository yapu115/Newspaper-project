"use strict"

// Variables
const postsContainer = document.querySelector(".posts")
const documentFragment = document.createDocumentFragment();
const date = new Date()

// Staff info 
const getStaffInfo = async ()=>{
    let request = await fetch("staff_info.txt")
    return await request.json()   
}

// Logged In
const loggedInValue = localStorage.getItem("loggedIn");
let loggedIn; 
if (loggedInValue) loggedIn = stringToBoolConvertion(loggedInValue);
else loggedIn = false; 

// IndexedDatabase
const DBRequestArticles = indexedDB.open("ArticlesDB",1);
const DBRequestUsers = indexedDB.open("usersDB", 1)




// Open DB
DBRequestArticles.addEventListener("upgradeneeded", ()=> {
    const db = DBRequestArticles.result;
    const store = db.createObjectStore("articles", {
        keyPath: "id",
        autoIncrement: true
    })
    
    store.createIndex("likesCount", "likes", { unique: false } )
    store.createIndex("commentsCount", "comments", { unique: false })
})



async function getUserInfo(){
    return new Promise((resolve, reject) => {
        DBRequestUsers.onsuccess = ()=>{
            const db = DBRequestUsers.result;
            const userId = parseInt(localStorage.getItem("userId"))
            getUserById(db, userId).then(userInfo => {
                resolve(userInfo)
            }).catch(error =>{
                console.log(error);
                reject(error);
            })
        }
        DBRequestUsers.onerror = ()=>{
            const error = new Error("Error obtaining user info");
            console.log(error);
            reject(error)
        }
    })
}

function getUserById(db, id){
    return new Promise((resolve, reject) => {
        const objectStore = getIDBUserData(db,"readonly")

        const request = objectStore.get(id);
        request.onsuccess = ()=> {
            resolve(request.result)
        }    
        request.onerror = ()=> {
            reject(new Error("Error obtaining the users"))
        }
    })
}

function getIDBUserData(db, mode){
    const transaction = db.transaction("users", mode)
    const objectStore = transaction.objectStore("users")
    return objectStore
}


// Succesfull DB open
DBRequestArticles.onsuccess = () => {
    const db = DBRequestArticles.result;
    

    // Articles db functions 

    function getIDBData(mode){
        const transaction = db.transaction("articles", mode)
        const objectStore = transaction.objectStore("articles")
        return objectStore
    }
    
    function saveArticle(article){
        const objectStore = getIDBData("readwrite")
        
        const request = objectStore.add(article)
        request.onsuccess = ()=> {
            console.log("Article saved")
        }
        request.onerror = ()=> {
            console.log("There has been an error")
        }
    }

    function getArticles(){
        return new Promise((resolve, reject) => {
            const objectStore = getIDBData("readonly")
    
            const request = objectStore.getAll();
            request.onsuccess = ()=> {
                const articles = request.result
                resolve(articles)
            }    
            request.onerror = ()=> {
                reject(new Error("Error obtaining the articles"))
            }
        })
    }

    function getArticleById(id){
        return new Promise((resolve, reject) =>{
            let objectStore = getIDBData("readonly")
            const request = objectStore.get(parseInt(id))
            request.onsuccess = ()=> {
                const article = request.result;
                resolve(article)
            }
            request.onerror = ()=>{
                reject(new Error("The ID doesnt match with any article"))
            }
        })
    }

    function updateArticleLikes(article, newLikes){
        return new Promise((resolve, reject) =>{
            let objectStore = getIDBData("readwrite")
            article.likes = newLikes;
            const request = objectStore.put(article)
            request.onsuccess = ()=> {
                resolve(request.result)
            }
            request.onerror = ()=>{
                reject(new Error("There was an error updating the article likes"))
            }
        })
    }

    function updateArticleComments(article, newComment){
        return new Promise((resolve, reject) =>{
            let objectStore = getIDBData("readwrite")
            article.comments.push(newComment);
            const request = objectStore.put(article)
            request.onsuccess = ()=> {
                resolve(request.result)
            }
            request.onerror = ()=>{
                reject(new Error("There was an error updating the article comment"))
            }
        })
    }


    
        


    //////////////////////////////////////////////////////////////

    // If the user is logged
    if (loggedIn){
        getUserInfo().then(userInfo =>{
            getArticles().then((articles) =>{
                for (let articleData of articles){
                    const id = articleData.id;
                    const title = articleData.title;
                    const subtitle = articleData.subtitle;
                    const img = articleData.img;
                    const date = articleData.date;
                    const author = articleData.author;
                    const body = articleData.bodyText;
                    const likes = articleData.likes;
                    const comments = articleData.comments;
                    const topics = articleData.topics;
                    
                    const article = createArticle(id, title, subtitle, img, date, author, body, topics, likes, comments, userInfo)
                    
                    documentFragment.appendChild(article)
                }
                postsContainer.appendChild(documentFragment)

                getStaffInfo().then(staffInfo => {
                    for (let staffUser of staffInfo){

                        if ((userInfo.username === staffUser.username) && (userInfo.password === staffUser.password))
                        {
                            let createArticleBtn = createNewArticleButton()
                            
                            const modalBackground = document.getElementById("modal-background");
                            const newArticleModal = document.getElementById("new-article-modal");
                            
                            // New article form
                            createArticleBtn.addEventListener("click", function() {
                                showNewArticleContainer(modalBackground, newArticleModal)
                            })
                            
                            modalBackground.addEventListener("click", function() {
                            modalBackground.style.display = "none";
                            newArticleModal.style.display = "none";
                            });
                        
                        
                            const newArtImgFile = document.getElementById("new-article-img-file");
                            const newArtImage = document.getElementById("new-article-img");
                            const increaseImgWidth = document.getElementById("increase-img-width")
                            const reduceImgWidth = document.getElementById("reduce-img-width")
                        
                        
                            // Select an image
                            newArtImgFile.addEventListener("change", function(event) {
                                let file = event.target.files[0];
                                
                                if (file) {
                                    let reader = new FileReader();
                                    reader.onload = function(event) {
                                        let urlImg = event.target.result;
                                        
                                        const img = document.createElement("img");
                                        img.src = urlImg;
                                        img.width = 300;
                                        
                                        newArtImage.innerHTML = "";
                                        newArtImage.appendChild(img);
                                        
                                        increaseImgWidth.style.display = "inline-block";
                                        reduceImgWidth.style.display = "inline-block";
                                        
                                        increaseImgWidth.addEventListener("click", function(){
                                            if (img.width < 400) img.width += 50
                                            console.log(img.width);
                                        })
                                        
                                        reduceImgWidth.addEventListener("click", function(){
                                            if (img.width > 200) img.width -= 50
                                            console.log(img.width);
                                        })
                                    };
                                    reader.readAsDataURL(file);
                                }
                            });
                        
                        
                            // Publish new article 
                            const publishNewArticleBtn = document.getElementById("publish-new-article-btn")
                            publishNewArticleBtn.addEventListener("click", () => {
                                
                                const title = document.getElementById("new-article-title").value;
                                const subtitle = document.getElementById("new-article-subtitle").value;
                                const img = document.getElementById("new-article-img-file").files[0];
                                const date = getCompleteDate()
                                const author = `${userInfo.name} ${userInfo.lastName}`
                                const bodyText = document.getElementById("new-article-body").value;
                                const topics = getNewArticleTopics();
                                
                                const commentsList = []
                                
                                const newArticleJSON = {
                                    title: title,
                                    subtitle: subtitle,
                                    img: img,
                                    date: date,
                                    author: author,
                                    bodyText: bodyText,
                                    likes: 0,
                                    comments: commentsList,
                                    topics: topics,
                                }
                                
                                saveArticle(newArticleJSON)
                                location.reload();
                                modalBackground.style.display = "none";
                                newArticleModal.style.display = "none";
                            })

                            const newTopicButton = document.getElementById("new-topic-btn");
                            const newTopicContainer = document.getElementById("new-topic-container");
                            
                            newTopicButton.addEventListener("click", ()=> {
                                newTopicButton.style.display = "none";
                                newTopicContainer.style.display = "block";
                            })

                            newTopicContainer.lastElementChild.addEventListener("click", ()=> {

                                const topicInput = document.getElementById("new-topic-input")
                                const topic = topicInput.value;

                                const divNewTopic = document.createElement("div");
                                divNewTopic.classList.add("new-topic");

                                const topicLabel = document.createElement("label");
                                const deleteTopic = document.createElement("button");

                                topicLabel.innerHTML = topic;
                                deleteTopic.innerHTML = "X";
                                divNewTopic.appendChild(topicLabel);
                                divNewTopic.appendChild(deleteTopic);

                                document.getElementById("new-article-topics").appendChild(divNewTopic);

                                topicInput.value = "";
                                newTopicButton.style.display = "block";
                                newTopicContainer.style.display = "none";
                            })
                        }
                    }
                })
                
            
                // Give like to a Document
                const likeButtons = document.querySelectorAll(".like-button")
                for (let button of likeButtons){
                    
                    button.addEventListener("click", ()=> {
                        const likeCount = button.nextElementSibling;
                        let currentLikes = parseInt(likeCount.textContent);
                        let buttonPostID = getParentElement(button, 4).id;
                        
                        let clickedState = localStorage.getItem(`clickedStateButton${buttonPostID}${userInfo.username}`);
                        let clicked;
                        if (clickedState)
                        clicked = stringToBoolConvertion(clickedState);
                        else
                        clicked = false;
                
                        getArticleById(buttonPostID).then((buttonArticle) =>{
                            if (!clicked) {
                                button.innerHTML = `<i class="fa-solid fa-heart"></i>`;
                                currentLikes ++;
                                clicked = true;
                            }
                            else {
                                button.innerHTML = `<i class="fa-regular fa-heart"></i>`;
                                currentLikes --;
                                clicked = false;
                            }
                            likeCount.textContent = currentLikes;
                            updateArticleLikes(buttonArticle, currentLikes).then(smt => {
                                console.log("Succesfull like update") 
                                localStorage.setItem(`clickedStateButton${buttonPostID}${userInfo.username}`, clicked)
                            }).catch(e =>{
                                console.log(e)
                            })
                        
                        }).catch(e =>{
                            console.log(e);
                        })
                    })
                }
        
                verifyCommentButtons("block");

                const cancelCommentButtons = document.querySelectorAll(".new-art-cancel-btn");
                for (let button of cancelCommentButtons){
                    const articleID = getParentElement(button, 5);
                    
                    button.addEventListener("click", ()=> {
                        
                        const commentElement = getParentElement(button, 1).previousElementSibling.lastElementChild;
                        commentElement.value = "";
                    })
                }


                // Save new Comment
                const confirmCommentButtons = document.querySelectorAll(".new-art-comment-btn")
                for (let button of confirmCommentButtons){
                    const articleId = getParentElement(button, 5).id;
                    button.addEventListener("click", ()=> {
                        const commentElement = getParentElement(button, 1).previousElementSibling.lastElementChild;
                        const comment = commentElement.value;
                        
                        if (comment.length > 0){
                            const username = userInfo.username;
                            const completeDate = getCompleteDate();
                            console.log(userInfo.picture)
                            const picture = userInfo.picture;
                            console.log(picture)
                            
                            const newComment = {
                                username: username,
                                date: completeDate,
                                picture: picture,
                                comment: comment,
                            }
                            
                            getArticleById(articleId).then((buttonArticle)=> {
                                updateArticleComments(buttonArticle, newComment).then(()=> {
                                    const divArticleComments = getParentElement(commentElement, 3).lastElementChild;
                                    const divArticleComment = createCommment(newComment);
                                    
                                    divArticleComments.appendChild(divArticleComment);
                                    commentElement.value = "";
                                    
                                }).catch(e=>{
                                    console.log(e)
                                })
                            }).catch(e=>{
                                console.log(e)
                            })
                        
                        }
                    })
                    // event click
                }
                // for
            }).catch(e=> {
                console.log(e);
            })
            // Get articles
        }).catch(e =>{
            console.log(e);
        })
        // get UserInfo
    }
    else {
        getArticles().then((articles) =>{
            for (let articleData of articles){
                const id = articleData.id;
                const title = articleData.title;
                const subtitle = articleData.subtitle;
                const img = articleData.img;
                const date = articleData.date;
                const author = articleData.author;
                const body = articleData.bodyText;
                const likes = articleData.likes;
                const comments = articleData.comments;
                
                const article = createArticle(id, title, subtitle, img, date, author, body, "a", likes, comments)
                
                documentFragment.appendChild(article)
            }
            postsContainer.appendChild(documentFragment)

            verifyCommentButtons("none");

        }).catch(e=>{
            console.log(e);
        })
            
    }
}
    
    
    
function verifyCommentButtons(display){
    const commentButtons = document.querySelectorAll(".comment-button");
    for (let button of commentButtons){
        let clicked = false;
        button.addEventListener("click", ()=> {
            let buttonArticleComments = getParentElement(button, 2).nextElementSibling;
            if (!clicked) {
                button.innerHTML = `<i class="fa-solid fa-comment"></i>`;
                buttonArticleComments.style.display = "block";
                
                const newArticleComment = buttonArticleComments.firstElementChild
                newArticleComment.style.display = display;
                
                clicked = true;
            }
            else {
                buttonArticleComments.style.display = "none";
                button.innerHTML = `<i class="fa-regular fa-comment"></i>`;
                clicked = false;
            }

        })
    }  
}


// Articles creation
function createHeader(title, subtitle, image){
    const header = document.createElement("HEADER");
    header.classList.add("heading");
    
    const imgLogo = document.createElement("IMG");
    imgLogo.classList.add("logo-head")
    imgLogo.setAttribute("src", "img/bugle_logo.jpg")
    imgLogo.setAttribute("width", "500")
    imgLogo.setAttribute("alt", "Bugle image")

    const h2 = document.createElement("H2");
    h2.classList.add("title")
    
    const p = document.createElement("P");
    p.classList.add("subtitle")

    const imgPost = document.createElement("IMG");
    imgPost.classList.add("post-photo")
    readFileImage(image).then(imgUrl => {
        imgPost.setAttribute("src", imgUrl);
    }).catch(error =>{
        console.log(error.message);
    })
    imgPost.setAttribute("width", "300")
    imgPost.setAttribute("alt", "article image")


    header.appendChild(imgLogo);
    header.appendChild(h2);
    header.appendChild(p);
    header.appendChild(imgPost);


    const textTitle = document.createTextNode(title)
    const textSubtitle = document.createTextNode(subtitle)

    h2.appendChild(textTitle)
    p.appendChild(textSubtitle)

    return header
}


function createSection(date, author, bodyText){
    const articleAuthor = author; 

    const section = document.createElement("SECTION");
    section.classList.add("post-content");
    
    const divWritter = document.createElement("DIV");
    divWritter.classList.add("post-writter");

    const divDate = document.createElement("DIV");
    divDate.classList.add("post-date")
    
    const pWritter = document.createElement("P");
    const textWritter = document.createTextNode(`Written by: ${articleAuthor}`)
    pWritter.appendChild(textWritter)
    
    const pDate = document.createElement("P");
    const textDate = document.createTextNode(getCompleteDateFormat(date))
    pDate.appendChild(textDate)
    
    divDate.appendChild(pDate)
    divWritter.appendChild(divDate)
    divWritter.appendChild(pWritter)
    
    section.appendChild(divWritter)
    
    const divBody = document.createElement("DIV");

    const divParagraph = document.createElement("DIV")
    const pParagraph = document.createElement("P")
    const textParagraph = document.createTextNode(bodyText)
    pParagraph.appendChild(textParagraph)
    divParagraph.appendChild(pParagraph)
    
    divBody.appendChild(divParagraph)

    section.appendChild(divBody)

    return section;
}


function createCommment(comment){
    const divArticleComment = document.createElement("div");
    divArticleComment.classList.add("article-comment");

    const imgArticleComment = document.createElement("img"); 
    readFileImage(comment.picture).then(imgUrl => {
        imgArticleComment.src = imgUrl;
    })

    const divArticleCommentText = document.createElement("div");
    divArticleCommentText.classList.add("article-comment-text");

    
    const divCommentUserData = document.createElement("div");
    divCommentUserData.classList.add("comment-user-data");

    const pCommentUsername = document.createElement("p");
    const bCommentUsername = document.createElement("b");
    bCommentUsername.innerHTML = comment.username;

    pCommentUsername.appendChild(bCommentUsername)

    const pCommentDate = document.createElement("p");
    pCommentDate.innerHTML = getDateDifference(comment.date)

    divCommentUserData.appendChild(pCommentUsername);
    divCommentUserData.appendChild(pCommentDate);

    const divCommentUserText = document.createElement("div");
    divCommentUserText.classList.add("comment-user-text");
    
    const pCommentUserText = document.createElement("p");
    pCommentUserText.innerHTML = comment.comment;

    divCommentUserText.appendChild(pCommentUserText);

    divArticleCommentText.appendChild(divCommentUserData);
    divArticleCommentText.appendChild(divCommentUserText);


    divArticleComment.appendChild(imgArticleComment)
    divArticleComment.appendChild(divArticleCommentText)

    return divArticleComment;
}



function createFooter(id, topics, likes, comments, userInfo){
    const footer = document.createElement("footer");
    footer.classList.add("article-footer");

    const divTopics = document.createElement("div")
    divTopics.classList.add("article-topics")

    for(const topic of topics){
        const pTopics = document.createElement("p");
        const textTopics = document.createTextNode(`#${topic}`);
        pTopics.appendChild(textTopics)
        divTopics.appendChild(pTopics);
    }


    const divButtonContainer = document.createElement("div");
    divButtonContainer.classList.add("buttons-container")
    
    for (let i = 0; i < 2; i++) {
        let buttonType;
        let iclassIconType;
        let iclassIcon;
        let count;
        if (i == 0){
            buttonType = "like"
            if (stringToBoolConvertion(localStorage.getItem(`clickedStateButton${id}${userInfo.username}`)))  
                iclassIconType = "fa-solid";
            else
                iclassIconType = "fa-regular";
        

            iclassIcon = "fa-heart"
            count = likes;
        }
        else{
            buttonType = "comment"
            iclassIconType = "fa-regular"
            iclassIcon = "fa-comment"
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

    if (loggedIn){
        const imgNewCommentUser = document.createElement("img");
        readFileImage(userInfo.picture).then(imgUrl => {
            imgNewCommentUser.src = imgUrl;
        }).catch(error =>{
            console.log(error.message);
        })
        divTextArticleComment.appendChild(imgNewCommentUser)
    }

    const textAreaNewComment = document.createElement("textarea");
    textAreaNewComment.placeholder = "Add a comment...";
    textAreaNewComment.name = "comment-text";

    divTextArticleComment.appendChild(textAreaNewComment);

    const divButtonsArticleNewComment = document.createElement("div");
    divButtonsArticleNewComment.classList.add("buttons-article-comment");

    const cancelButton = document.createElement("button");
    cancelButton.classList.add("new-art-cancel-btn")
    cancelButton.type = "button";
    cancelButton.innerHTML = "Cancel";

    const commentButton = document.createElement("button")
    commentButton.classList.add("new-art-comment-btn")
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



    
    footer.appendChild(divTopics);
    footer.appendChild(divButtonContainer);
    footer.appendChild(divArticleCommentSection);

    return footer;
}


function createArticle(id, title, subtitle, image, date, author, bodyText, topics, likes, comments, userInfo={}){
    const article = document.createElement("article"); 
    article.classList.add("post");
    article.id = id;

    const header = createHeader(title, subtitle, image)
    article.appendChild(header);

    const section = createSection(date, author, bodyText)
    article.appendChild(section);

    const footer = createFooter(id, topics, likes, comments, userInfo)
    article.appendChild(footer)

    return article
}











// New articles creation documents/ implementation
function createNewArticleButton() {
    let createArticleBtn = document.createElement("button")
    let createArticleDiv = document.getElementById("new-article-button-div")
    createArticleBtn.setAttribute("id", "create-article-button")
    createArticleBtn.setAttribute("type", "button")
    
    createArticleDiv.appendChild(createArticleBtn) 
    const botonText = document.createTextNode(`New Article`)
    createArticleBtn.appendChild(botonText)
    
    return createArticleBtn
}

function showNewArticleContainer(modalBackground, newArticleModal) {
    modalBackground.style.display = "block";
    newArticleModal.style.display = "block";    
    
    let newArticleTitle = document.getElementById("new-article-title");
    let newArticleSubtitle = document.getElementById("new-article-subtitle");
    let newArticleBody = document.getElementById("new-article-body");
    
    newArticleTitle.value = "";
    newArticleSubtitle.value = "";
    newArticleBody.value = "";
    
    applyTextAreaStyle(newArticleTitle)
    applyTextAreaStyle(newArticleSubtitle)
    
    document.getElementById("new-article-date").innerHTML = `${getCompleteDateFormat(getCompleteDate())}`
}

// Usefull functions
////////////////////////////////////////////////////////

function getNewArticleTopics(){
    const topicsList = [];
    const topicDivs = document.querySelectorAll(".new-topic");
    for(const topicDiv of topicDivs){
        const topic = topicDiv.firstElementChild.innerHTML;
        topicsList.push(topic);
    }
    return topicsList;
}








// convertion
function stringToBoolConvertion(string) {
    let boolStatus
    if (string == "true") boolStatus = true
    else boolStatus = false
    return boolStatus
}


// Image reader
function readImage(imageFile){
    let file = imageFile.target.files[0];
    
    if (file) {
        let reader = new FileReader();
        reader.onload = function(imageFile) {
            let urlImg = imageFile.target.result;
            
            const img = document.createElement("img");
            img.src = urlImg;
            img.width = 300
            
            
        };
        reader.readAsDataURL(file);
    }
}

// Image File reader
const readFileImage = (file) => {
    if (file) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith("image/")){
                reject(new Error("The file is not an image"))
                return;
            }

            const reader = new FileReader();
    
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                resolve(imageUrl)
            };
            
            reader.onerror = ()=> {
                reject(new Error("Error reading the  file"));
            }
            reader.readAsDataURL(file);
        })
    }
}


// Text area styles
const applyTextAreaStyle = (textarea)=> {
    textarea.addEventListener("input",function(){
        if (this.value.length > 31){
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px';
        }
    })
}


// Date format
const getCompleteDateFormat = (dateString)=> {
    const date = new Date(dateString);
    let suffix;
    let day = date.getDate()

    if (day === 1 || day === 21 || day === 31){
        suffix = "st"
    }
    else if (day === 2 || day === 22){
        suffix = "nd"
    }
    else if (date === 3 || day === 23){
        suffix = "rd"
    }
    else {
        suffix = "th"
    }

    const completeDate = `${date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric', 
    }) + suffix} ${date.getFullYear()}`; 
    
    return completeDate
}

const getCompleteDate = ()=> {
    return `${date.toLocaleDateString('en-US', {
        day: 'numeric', 
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })}`;
}

const getDateDifference = (dateString)=> {
    const initialdate = new Date(dateString);
    const actualDate = new Date(getCompleteDate());

    
    const milisDifference = actualDate - initialdate;
    const minutesDifference = Math.floor(milisDifference / (1000*60));
    const hoursDifference = Math.floor(minutesDifference / 60)
    const daysDifference = Math.floor((hoursDifference) / 24);
    const weeksDifference = Math.floor((daysDifference) / 7);
    const monthsDifference = Math.floor((weeksDifference) / 30);
    const yearsDifference = Math.floor((monthsDifference) / 12);


    const dateFormat = (dateDifference, dateType)=>{
        let dateFormat;    
        if (dateDifference === 1)
            dateFormat = `1 ${dateType} ago`
        else
            dateFormat = `${dateDifference} ${dateType}s ago`

        return dateFormat;
        
    }

    let dateDiffference;
    if (yearsDifference > 0){
        dateDiffference = dateFormat(yearsDifference, "year")
    }
    else if (monthsDifference > 0){
        dateDiffference = dateFormat(monthsDifference, "month")
    }
    else if (weeksDifference > 0){
        dateDiffference = dateFormat(weeksDifference, "week")

    }
    else if (daysDifference > 0){
        dateDiffference = dateFormat(daysDifference, "day")
    }
    else if (hoursDifference > 0){
        dateDiffference = dateFormat(hoursDifference, "hour")
    }
    else if (minutesDifference > 0){
        dateDiffference = dateFormat(minutesDifference, "minute")
    }
    else {
        dateDiffference = `A few seconds ago`
    }

    return dateDiffference
}



const getParentElement = (element, timesFather) =>{
    for (let i = 0; i < timesFather; i++) {
        element = element.parentNode;
    }
    return element;
}


