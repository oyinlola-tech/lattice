export type UserId = string & { readonly __brand: "UserId" };
export type StudentId = string & { readonly __brand: "StudentId" };
export type EnrollmentId = string & { readonly __brand: "EnrollmentId" };
export type AssessmentId = string & { readonly __brand: "AssessmentId" };
export type SubmissionId = string & { readonly __brand: "SubmissionId" };
export type NotificationId = string & { readonly __brand: "NotificationId" };
export type CourseId = string & { readonly __brand: "CourseId" };

export function createUserId(id: string): UserId { return id as UserId; }
export function createStudentId(id: string): StudentId { return id as StudentId; }
export function createEnrollmentId(id: string): EnrollmentId { return id as EnrollmentId; }
export function createAssessmentId(id: string): AssessmentId { return id as AssessmentId; }
export function createSubmissionId(id: string): SubmissionId { return id as SubmissionId; }
export function createNotificationId(id: string): NotificationId { return id as NotificationId; }
export function createCourseId(id: string): CourseId { return id as CourseId; }
