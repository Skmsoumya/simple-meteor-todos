import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { Tasks } from  '../apis/tasks';

import AccountsUIWrapper from "./AccountsUIWrapper";
import Task from './Task.js';
 
// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);


    this.state = {
      hideCompleted: false,
    }
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;
    if(this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    const currentUserId = this.props.currentUser && this.props.currentUser._id;
    return filteredTasks.map((task) => {
      const showPrivateBtn = task.owner === currentUserId;

      return (
        <Task   key={task._id} 
                task={task} 
                showPrivateButton={showPrivateBtn}
        />
      );
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

    Meteor.call("tasks.insert", text);

    ReactDOM.findDOMNode(this.refs.textInput).value = "";
  }

  toggleHideCompleted() {
    this.setState(prevState => ({
      hideCompleted: !prevState.hideCompleted
    }));
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List ({this.props.inCompleteTaskCount})</h1>

          <label className="hide-completed">
            <input 
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Tasks
          </label>

          <AccountsUIWrapper/>

          {
            this.props.currentUser && (
              <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
                <input 
                  type="text"
                  ref="textInput"
                  placeholder="Type to add new tasks"
                >
                </input>
              </form>
            )
          }
          
        </header>
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe("tasks");

  return {
    tasks: Tasks.find({}, {sort: { createdAt: -1 } }).fetch(),
    inCompleteTaskCount: Tasks.find({checked: {$ne: true} }).count(),
    currentUser: Meteor.user(),
  };
})(App);