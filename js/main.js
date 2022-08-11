var modal = document.getElementById("modalBox");

// makes modal window appear on click
function showModal() {
    modal.style.display = "block";
}

// closes modal window upon pressing "Got it!"
function closeModal() {
    modal.style.display = "none";
}

// closes modal window upon clicking outside of box
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// allows user to search for fact by pressing enter instead of clicking button
// DOM needs to load before keyInput can have an addEventListener
document.addEventListener('DOMContentLoaded', function() {
    var keyInput = document.getElementById("keyInput");

    keyInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            document.getElementById("searchBtn").click();
        }
    });
});

// helper to remove input box from search screen
function removeInputBox() {
    let inputBox = document.getElementById("inputBox");

    inputBox.style.display = "none";
}

// helper to change title display from search screen
function shrinkTitle() {
    let pretitle = document.getElementById("pretitle");
    let title = document.getElementById("title");
    let modalBox = document.getElementById("modalBox");

    pretitle.style.display = "none";
    title.style.fontSize = "40px";
    modalBox.style.marginTop = "-25px";
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

        if (fact) {
            factSpace.showExistingFact(fact, false);
        } else {
            factSpace.showNewFact(searchVal, false);
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

        removeInputBox();
        shrinkTitle();

        existingFact.style.display = "block";
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

        removeInputBox();
        shrinkTitle();

        newFact.style.display = "block";
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

            newSearchScreen(true);

        } catch (err) {
            console.log(err);

            currentId = null;
            currentKey = null;

            return null;
        }
    }

    // creates and inserts a new fact into db based on key
    async function addFact(testing) {
        if (testing) {
            var factData = { fact: "test fact body" };
        } else {
            var factInput = document.getElementById("factInput").value;

            // check if input is blank
            if (factInput.match(/^\s*$/)) {
                alert("You must enter a fact to add it!");
                return;
            }

            var factData = { fact: factInput };
        }
        
        try {
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

            newSearchScreen(false);
            
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