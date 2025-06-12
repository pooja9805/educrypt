const Assignment = require("../models/AssignmentModel");
const Submission = require("../models/SubmissionModel");

exports.getUpcomingNotifications = async (studentId) => {
  const allAssignments = await Assignment.find();
  const submissions = await Submission.find({ student: studentId });

  const submittedIds = submissions.map((s) => s.assignment.toString());
  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const upcoming = allAssignments.filter((a) => {
    const due = new Date(a.dueDate);
    return !submittedIds.includes(a._id.toString()) && due <= twoDaysLater && due >= now;
  });

  return upcoming.map((a) => ({
    type: "assignment",
    message: `Reminder: "${a.title}" is due on ${new Date(a.dueDate).toLocaleDateString()}`,
    dueDate: a.dueDate,
    course: a.course,
  }));
};
