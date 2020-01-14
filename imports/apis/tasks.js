import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');

/* 
    Publish tasks to the client.
    Only publish tasks that are public or that belongs to the user. 
*/
if(Meteor.isServer) {
    Meteor.publish("tasks", function taskPublication() {
        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId },
            ],
        });
    });
}

Meteor.methods({
    "tasks.insert"(text) {
        check(text, String);
        /* 
            check if the user is logged in
        */
        if(!this.userId) {
            throw new Meteor.Error("not-authorized");
        }

        Tasks.insert({
            text,
            createdAt: new Date(),
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username
        });
    },
    "tasks.remove"(taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);

        if(task.private && task.owner !== this.userId) {
            // If the task is private make sure only the owner can delete it.
            throw new Meteor.Error("not-authorized");
        }

        Tasks.remove(taskId);
    },
    "tasks.setChecked"(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);

        const task = Tasks.findOne(taskId);

        if(task.private && task.owner !== this.userId) {
            // If the task is private make sure only the owner can set it checked.
            throw new Meteor.Error("not-authorized");
        }

        Tasks.update(taskId, { $set: { checked: setChecked } });
    },
    "tasks.setPrivate"(taskId, setPrivate) {
        check(taskId, String);
        check(setPrivate, Boolean);

        const task = Tasks.findOne(taskId);

        if(task.owner !== this.userId) {
            throw new Meteor.Error("not-authorized");
        }

        Tasks.update(taskId, { $set: {  private: setPrivate } });
    },
});