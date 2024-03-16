let loggedIn


const getInfo = async ()=>{
    let request = await fetch("staff_info.txt")
    return await request.json()   
}

function checkLogin(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    getInfo().then(usersInfo => {
        for (let userInfo in usersInfo){
            
            let user = usersInfo[userInfo].username;
            let userPassword = usersInfo[userInfo].password;
            
            if (user == username && password == userPassword){
                loggedIn = true;
                welcomeUser(usersInfo[userInfo])
                localStorage.setItem("loggedIn", loggedIn);
            }
            else if (user === username && password != userPassword){
                let errorMessageP = document.createElement("p");
                let errorMessageDiv = document.getElementById("form-password");
                
                errorMessageP.setAttribute("id", "error-message");
                errorMessageDiv.appendChild(errorMessageP);
                
                const errorText = document.createTextNode(`Wrong password`);
                errorMessageP.appendChild(errorText);
            }            
        }
    })    
}
document.getElementById('login-button').addEventListener("click", checkLogin);


function welcomeUser(userInfo){
    document.querySelector(".login-container").remove();

    let welcomeDiv = document.createElement("div");
    welcomeDiv.setAttribute("id", "welcome-container")

    let userForm = document.getElementById("user-form");
    userForm.appendChild(welcomeDiv); 

    let userPicture = document.createElement("img");
    userPicture.setAttribute("src", userInfo.picture)
    userPicture.setAttribute("id", "user-picture")

    const welcomeText = document.createTextNode(`Welcome back ${userInfo.name}!`)
    const welcomeP = document.createElement("p")
    welcomeP.appendChild(welcomeText)
    welcomeP.setAttribute("id", "welcome-text")

    
    welcomeDiv.appendChild(welcomeP)
    welcomeDiv.appendChild(userPicture)

}








console.log(localStorage.getItem("loggedIn"));





