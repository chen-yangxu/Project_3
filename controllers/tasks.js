const User = require('../models/user');
const moment = require('moment');

// Indexing all the tasks for a certain user
function tasksIndex(req, res, next) {
  User
    .findById(req.params.id)
    .then(user => {
      if(user.id === req.currentUser.id) {
        const todaysTasks = [];
        user.tasks.forEach(e => {
          if (moment(new Date()).format('MMM Do YY') === moment(e.dueDate).format('MMM Do YY')) {
            todaysTasks.push(e);
          }
        });
        res.json(todaysTasks);
      } else {
        res.json({ message: 'Unauthorized' });
      }
    })
    .catch(err => next(err));
}

// Making a new task - it automatically assigns `actionRequired` as true for the new task.
function tasksCreate(req, res, next) {
  User
    .findById(req.params.id)
    .then(user => {
      if(user.id === req.currentUser.id) {
        req.body.actionRequired = true;
        user.tasks.push(req.body);
        return user.save();
      } else {
        res.json({ message: 'Unauthorized' });
      }
    })
    .then(user => res.json(user))
    .catch(err => next(err));
}

// This 'deletion' function will be used for completing a task. It will update the user's score when you do it.
function tasksComplete(req, res, next) {
  User
    .findById(req.params.id)
    .then(user => {
      if(user.id === req.currentUser.id) {
        const task = user.tasks.id(req.params.taskId);
        if (!user.score) {
          user.score = 0;
        }
        user.score += 5;
        if (!user[`${task.title}Score`]) {
          user[`${task.title}Score`] = 0;
        }
        user[`${task.title}Score`] += task.points;
        // All of these lines above could be used in the future to determine how to increment the score on the main user data. I think this is actually subject to change depending on the naming conventions we call our tasks etc. For instance, if we do this our task title can't have spaces in it.
        task.actionRequired = false;
        if (!task.recurring) {
          task.remove();
        }
        // For recurring tasks, we might not remove this.
        user.save();
        return res.status(202).json(user);
      } else {
        res.json({ message: 'Unauthorized' });
      }
    })
    .catch(err => next(err));
}

//  Finding a particular task by the task Id
function tasksShow(req, res, next) {
  User
    .findById(req.params.id)
    .then(user => {
      if(user.id === req.currentUser.id) {
        const task = user.tasks.id(req.params.taskId);
        res.json(task);
      } else {
        res.json({ message: 'Unauthorized' });
      }
    })
    .catch(err => next(err));
}

function tasksEdit(req, res, next) {
  // This will need some sort of validation later, since we want only the currently logged in user to be able to edit a task.
  User
    .findById(req.params.id)
    .then(user => {
      if(user.id === req.currentUser.id) {
        let task = user.tasks.id(req.params.taskId);
        task = Object.assign(task, req.body);
        user.save();
        res.json(task);
      } else {
        res.json({ message: 'Unauthorized' });
      }
    })
    .catch(err => next(err));
}

function tasksDelete(req, res, next) {
  // This will need some sort of validation later, since we want only the currently logged in user to be able to delete a task.
  User
    .findById(req.params.id)
    .then(user => {
      if(user.id === req.currentUser.id) {
        const task = user.tasks.id(req.params.taskId);
        task.remove();
        return user.save();
      } else {
        res.json({ message: 'Unauthorized' });
      }
    })
    .then(task => res.json(task))
    .catch(err => next(err));
}

// Remaining tasks:

module.exports = {
  tasksIndex: tasksIndex,
  tasksCreate: tasksCreate,
  tasksShow: tasksShow,
  tasksEdit: tasksEdit,
  tasksComplete: tasksComplete,
  tasksDelete: tasksDelete
};