const antiTrollsSecurity = (string) => {
    // return string.split("").filter(char => {
    //     return !"AaEeIiOoUu".includes(char)
    // })
    // .join("");

    return string.replace(/[aeiou]/gi, "")
};

module.exports = antiTrollsSecurity;
