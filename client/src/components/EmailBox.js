import React from "react";
import "./EmailBox.css";

var emailList = [];


class EmailBox extends React.Component {
    state = {
    items: [],
    value: "",
    error: null
    };

    // insert the new email to the global email list
    saveEmail = (email) => {
      emailList.push(email);
    }

    // when closing the menu window, clean the email list
    clearEmailList(){
      emailList = [];
      return emailList;
    }

    // update the emails state
    handleKeyDown = evt => {
    if (["Enter", "Tab", ","].includes(evt.key)) {
      evt.preventDefault();

      var value = this.state.value.trim();

      if (value && this.isValid(value)) {
      this.setState({
          items: [...this.state.items, this.state.value],
          value: ""
      });
      this.saveEmail(value);
      }
    }
    };

    handleChange = evt => {
    this.setState({
      value: evt.target.value,
      error: null
    });
    };

    // function for deleting email from the list
    handleDelete = item => {
      this.setState({
          items: this.state.items.filter(i => i !== item)
      });
      // Removing the deleted email from the email list
      for (var i = 0; i < emailList.length; i++) {
          if (emailList[i] === item) {
              var spliced = emailList.splice(i, 1);
          }
      }
    };

    // checks if the email address is valid and isn't in the list already
    isValid(email) {
      let error = null;

      if (this.isInList(email)) {
          error = `${email} has already been added.`;
      }

      if (!this.isEmail(email)) {
          error = `${email} is not a valid email address.`;
      }

      if (error) {
          this.setState({ error });

          return false;
      }

      return true;
    }

    // function for checking if the email is already in the list
    isInList(email) {
      return this.state.items.includes(email);
    }

    isEmail(email) {
      return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
    }

    // send the email list
    sendEmails(){
      return emailList;
    }

  render() {
    return (
      <>
        {this.state.items.map(item => (
          <div className="tag-item" key={item}>
            {item}
            <button
              type="button"
              className="button"
              onClick={() => this.handleDelete(item)}
            >
              &times;
            </button>
          </div>
        ))}

        <input
          className={"input " + (this.state.error && " has-error")}
          value={this.state.value}
          placeholder="Type emails for sharing and press `Enter`"
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          style={{marginBottom: 7}}
        />

        {this.state.error && <p className="error">{this.state.error}</p>}
      </>
    );
  }
}

const rootElement = document.getElementById("root");
export default EmailBox;
