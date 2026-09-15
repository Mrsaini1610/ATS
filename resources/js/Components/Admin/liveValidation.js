const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

export function validateAdminField(field, value, data = {}) {
  const text = String(value ?? "").trim();

  switch (field) {
    case "name":
    case "candidateName":
      return text ? "" : "Name is required.";
    case "title":
      return text ? "" : "Title is required.";
    case "username":
      return text.length >= 3 ? "" : "Username must be at least 3 characters.";
    case "login":
      return text ? "" : "Email or username is required.";
    case "email":
      return !text || emailPattern.test(text) ? "" : "Enter a valid email address.";
    case "phone":
    case "candidatePhone":
      return !text || phonePattern.test(text) ? "" : "Phone must contain exactly 10 digits.";
    case "website":
      return !text || /^https?:\/\/[^\s]+$/i.test(text) ? "" : "Enter a valid website URL.";
    case "description":
    case "message":
      return text.length <= 2000 ? "" : "Maximum 2000 characters allowed.";
    case "password":
      return !text || text.length >= 6 ? "" : "Password must be at least 6 characters.";
    case "current_password":
      return text ? "" : "Current password is required.";
    case "new_password":
      return text.length >= 8 ? "" : "New password must be at least 8 characters.";
    case "dueDate":
    case "date":
      return !text || text >= new Date().toISOString().slice(0, 10) ? "" : "Date cannot be in the past.";
    case "assignedTo":
      return text ? "" : "Please select a team member.";
    case "category":
      return text ? "" : "Category is required.";
    case "recipient_ids":
      return Array.isArray(value) && value.length ? "" : "Select at least one recipient.";
    default:
      return "";
  }
}

export function updateAdminField(setData, setError, clearErrors, field, value, data = {}) {
  setData(field, value);
  const message = validateAdminField(field, value, { ...data, [field]: value });
  if (message) setError(field, message);
  else clearErrors(field);
}
