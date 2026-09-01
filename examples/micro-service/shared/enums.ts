export enum UserRole {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
  ADMIN = "admin",
}

export enum EnrollmentStatus {
  ENROLLED = "enrolled",
  WITHDRAWN = "withdrawn",
  COMPLETED = "completed",
}

export enum AssessmentType {
  QUIZ = "quiz",
  MIDTERM = "midterm",
  FINAL = "final",
  ASSIGNMENT = "assignment",
}

export enum SubmissionStatus {
  SUBMITTED = "submitted",
  GRADED = "graded",
  RETURNED = "returned",
}

export enum NotificationType {
  USER_CREATED = "user.created",
  STUDENT_ENROLLED = "student.enrolled",
  STUDENT_WITHDRAWN = "student.withdrawn",
  ASSESSMENT_SUBMITTED = "assessment.submitted",
  RESULT_PUBLISHED = "result.published",
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
}
