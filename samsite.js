        function validateForm() {
        let x = document.forms["details"]["email"].value;
        let y = document.forms["details"]["comment"].value;
        if (x == "" || y == "")
        {
            alert("Email and comment must be filled out");
            return false;
        }
    }