// makes modal window appear on click
function showModal() {
    var modal = document.getElementById("modalBox");
    modal.style.display = "block";
}

// closes modal window upon pressing "Got it!"
function closeModal() {
    var modal = document.getElementById("modalBox");
    modal.style.display = "none";
}

// closes modal window upon clicking outside of box
window.onclick = function(event) {
    var modal = document.getElementById("modalBox");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// linearly fades in given DOM elements using recursion
function fadeIn(first, second, third) {
    if (first == null) return;

    let toFadeIn = document.getElementById(first);

    var opacity = 0;

    var intervalID = setInterval(function() {
        if (opacity < 1) {
            opacity += 0.1;
            toFadeIn.style.opacity = opacity;
        } else {
            clearInterval(intervalID);
            fadeIn(second, third, null);
        }
    }, 50);
}

// fades out given DOM element
function fadeOut(element) {
    let toFadeOut = document.getElementById(element);

    var intervalID = setInterval(function() {
        if (toFadeOut.style.opacity > 0) {
            toFadeOut.style.opacity -= 0.1;
        } else {
            clearInterval(intervalID);
        }
    }, 50);
}

// allows user to search for fact by pressing enter instead of clicking button
// DOM needs to load before keyInput can have an addEventListener
// also calls fadeIn to trigger starting animation
document.addEventListener('DOMContentLoaded', function() {
    var keyInput = document.getElementById("keyInput");

    keyInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            document.getElementById("searchBtn").click();
        }
    });

    fadeIn("pretitle", "title", "inputBox");
});

// helper to change title display from search screen
function shrinkTitle() {    
    let pretitle = document.getElementById("pretitle");
    let title = document.getElementById("title");
    let modalBox = document.getElementById("modalBox");
    let inputBox = document.getElementById("inputBox");

    inputBox.style.display = "none";

    pretitle.style.display = "none";
    title.style.fontSize = "40px";
    modalBox.style.marginTop = "-25px";

    fadeIn("title");
}

// removes body elements of existingFact div
function removeExistingFactElements() {
    document.getElementById("existingFactHeader").remove();
    document.getElementById("factBody").remove();
    document.getElementById("views").remove();
    document.getElementById("likes").remove();
}

// removes body elements of newFact div
function removeNewFactElements() {
    document.getElementById("newFactHeader").remove();
    document.getElementById("newFactSubheader").remove();
    document.getElementById("factInput").remove();
}

// changes screen to show a new search screen for user to input number (NOT STARTING SCREEN)
function newSearchScreen(justUpdated) {
    if (justUpdated) {
        removeExistingFactElements();
        document.getElementById("existingFact").style.display = "none";
    } else {
        removeNewFactElements();
        document.getElementById("newFact").style.display = "none";
    }

    let inputBox = document.getElementById("inputBox");
    inputBox.style.display = "block";
    inputBox.style.marginTop = "175px";
    fadeIn("inputBox");

    // clears input field
    document.getElementById("keyInput").value = "";
}

// fetches for requested fact from server based on user input
// TEST: returns existing fact or null otherwise
async function search(testing, testVal) {
    try {
        var searchVal;

        if (testing) {
            searchVal = testVal;
        } else {
            searchVal = document.getElementById("keyInput").value;

            if (searchVal == "") {
                alert("Please enter a number first!");
                return;
            }

            searchVal = parseInt(searchVal);
        }

        const response = await fetch('/api/v1/facts?key=' + searchVal);
        const fact = response.status == 201 ? await response.json() : null;

        if (testing) {
            if (fact) return fact;
            return searchVal;
        }

        fadeOut("inputBox");
        fadeOut("pretitle");
        fadeOut("title");
        setTimeout(shrinkTitle, 1000);

        if (fact) {
            setTimeout(factSpace.showExistingFact, 1250, fact, false);
            // factSpace.showExistingFact(fact, false);
        } else {
            // factSpace.showNewFact(searchVal, false);
            setTimeout(factSpace.showNewFact, 1250, searchVal, false);
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

// module pattern used to keep track of current fact ID or new fact key to update db after user finishes with fact
var factSpace = function() {
    var currentId = null;
    var currentKey = null;

    // getter functions
    function getId() {
        return currentId;
    }

    function getKey() {
        return currentKey;
    }

    function resetVars() {
        currentId = null;
        currentKey = null;
    }

    // displays an existing fact and allows user to like the fact which would update the fact in the db
    // NOTE: views MUST be incremented every time an existing fact is shown
    function showExistingFact(fact, testing) {
        currentId = fact._id;
        currentKey = fact.key;

        if (testing) return;

        var existingFact = document.getElementById("existingFact");
        var factDetails = document.getElementById("factDetails");
        
        const header = document.createElement("h1");
        header.textContent = "Fact " + fact.key;
        header.id = "existingFactHeader";
        existingFact.insertBefore(header, factDetails);

        const body = document.createElement("p");
        body.textContent = fact.fact;
        body.id = "factBody"
        existingFact.insertBefore(body, factDetails);

        const views = document.createElement("h6");
        views.textContent = fact.views  + " user(s) have read this fact before you."
        views.id = "views";
        factDetails.appendChild(views);

        const likes = document.createElement("h6");
        likes.textContent = fact.likes + " enjoyed learning about it!"
        likes.id = "likes";
        factDetails.appendChild(likes);

        existingFact.style.display = "block";
        fadeIn("existingFact");
    }

    // displays an input box that allows user to input their own fact which would create the fact in the db
    function showNewFact(key, testing) {
        currentKey = key;

        if (testing) return;

        var newFact = document.getElementById("newFact");
        var factOptions = document.getElementsByClassName("factOptions")[1];

        const header = document.createElement("h1");
        header.textContent = "Fact " + key;
        header.id = "newFactHeader"
        newFact.insertBefore(header, factOptions);

        const subheader = document.createElement("h3");
        subheader.textContent = "No fact here, add one of your own!";
        subheader.id = "newFactSubheader"
        newFact.insertBefore(subheader, factOptions);

        const factInput = document.createElement("textarea");
        factInput.placeholder = "Something something interesting...";
        factInput.maxLength = "500";
        factInput.id = "factInput";
        newFact.insertBefore(factInput, factOptions);

        newFact.style.display = "block";
        fadeIn("newFact");
    }

    // updates current fact in server based on id and userLiked
    async function updateFact(userLiked, testing) {
        if (currentId == null) {
            console.log("Cannot update, no fact id present");
            return null;
        }

        try {
            const response = await fetch('/update?liked=' + userLiked + '&id=' + currentId, { method: 'POST' });

            if (response.status == 404) {
                console.log("Something went wrong with accessing DB");
                return null;
            }

            if (userLiked) {
                alert("Factastic! I'm sure fact " + currentKey + " likes you too! :)");
            }
    
            currentId = null;
            currentKey = null;
            
            if (testing) return;

            fadeOut("existingFact")
            setTimeout(newSearchScreen, 1000, true);

        } catch (err) {
            console.log(err);

            currentId = null;
            currentKey = null;

            return null;
        }
    }

    // creates and inserts a new fact into db based on key
    async function addFact(toAdd, testing) {
        if (testing) {
            var factData = { fact: "test fact body" };
        } else {
            if (toAdd) {
                var factInput = document.getElementById("factInput").value;

                // check if input is blank
                if (factInput.match(/^\s*$/)) {
                    alert("You must enter a fact to add it!");
                    return;
                }
    
                var factData = { fact: factInput };
            }
        }
        
        try {
            if (toAdd) {
                var response = await fetch('/create?key=' + currentKey, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(factData)
                });
    
                if (response.status == 400) {
                    console.log("Something went wrong with accessing DB");
                    return null;
                } else {
                    alert("Successfully added fact " + currentKey + ", thank you for your contribution!");
    
                    currentKey = null;
    
                    if (testing) return;
                }
            }

            fadeOut("newFact");
            setTimeout(newSearchScreen, 1000, false);
            
        } catch (err) {
            console.log(err);

            currentKey = null;

            return null;
        }
    }

    return {
        getId: getId,
        getKey: getKey,
        resetVars: resetVars,
        showExistingFact: showExistingFact,
        showNewFact: showNewFact,
        update: updateFact,
        addFact: addFact
    }
}();

module.exports = {
    search,
    factSpace
};