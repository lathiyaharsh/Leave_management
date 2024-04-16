

module.exports = {
  userMassage: {
    success: {
      signUpSuccess: "The user has successfully signed up.",
      signUpSuccessWithEmail:
        "The user has successfully signed up. email send to your registered email.",
      loginSuccess: "The user has been successfully logged in.",
      profileRetrieved: "The user profile has been successfully retrieved.",
      delete: "User and associated Data deleted successfully",
      update: "User Data updated successfully",
      logout: "Logged out successfully",
      leaveRequest: "Leave request send successfully",
      leaveStatus: "Leave status retrieved successfully",
      leaveBalance: "Leave Balance retrieved successfully",
      leaveApproval: "Leave approved successfully",
      leaveReject: "Leave rejected successfully",
    },
    error: {
      unauthorized: "Unauthorized - invalid token",
      tokenMissing: "Unauthorized - token missing",
      invalidCredentials: "Invalid credentials",
      userNotFound: "User not found",
      genericError: "An error occurred. please try again later.",
      signUperror: "The user sign-up process was unsuccessful.",
      passwordNotMatch: "The password and confirm password do not match.",
      invalidEmail:
        "There is already a user registered with this email address.",
      wrongPassword: "Wrong password",
      fillDetails: "Please provide user details.",
      uploadImage: "Image upload unsuccessful",
      password: "Your password should be between 6-20 characters!",
      delete: "The details of the user were not deleted.",
      update: "User Data not updated successfully",
      leaveRequest: "Leave request not send successfully",
      leaveStatus:"Leave already approved or rejected"
    },
  },
};
