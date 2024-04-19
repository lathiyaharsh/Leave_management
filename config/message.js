

module.exports = {
  userMassage: {
    success: {
      signUpSuccess: "The user has successfully signed up.",
      signUpSuccessWithEmail:
        "The user has successfully signed up. email sent to your registered email.",
      loginSuccess: "The user has been successfully logged in.",
      profileRetrieved: "The user profile has been successfully retrieved.",
      delete: "User and associated Data deleted successfully",
      update: "User Data updated successfully",
      logout: "Logged out successfully",
      leaveRequest: "Leave request sent successfully",
      leaveStatus: "Leave status retrieved successfully",
      leaveBalance: "Leave Balance retrieved successfully",
      leaveApproval: "Leave approved successfully",
      leaveReject: "Leave rejected successfully",
      studentList: "The list has been retrieved successfully.",
      userDelete:"The user has been deleted successfully.",
      otp:"The otp has been send successfully.",
      otpVerify:"The otp successfully verified.",
      leaveUpdate:"The leave update email send successfully.",
      leaveUpdateWithOutEmail:"The leave updated successfully. but email not send successfully. please update to user",
    },
    error: {
      unauthorized: "Unauthorized - invalid token",
      tokenMissing: "Unauthorized - token missing",
      invalidCredentials: "Invalid credentials",
      userNotFound: "User not found",
      genericError: "An error occurred. please try again later.",
      signUpError: "The user sign-up process was unsuccessful.",
      passwordNotMatch: "The password and confirm password do not match.",
      invalidEmail:
        "There is already a user registered with this email address.",
      wrongPassword: "Wrong password",
      fillDetails: "Please provide the details of the user.",
      uploadImage: "The image upload was unsuccessful.",
      password: "Your password should be between 4-20 characters!",
      delete: "The user's details were not deleted.",
      update:"The user's data was not updated successfully.",
      leaveRequest: "The leave request was not sent successfully.",
      leaveStatus:"Leave request has been already been approved or rejected.",
      leaveStatusError:"You cannot modify the status of your leave.",
      leaveRequestLimit:"You have already requested for a leave twice and I'm waiting for the approval.",
      studentList: "The student list has not been retrieved successfully.",
      studentUpdateRole:"This individual is not a student.",
      hodUpdateRole:"This individual is not a HOD .",
      facultyUpdateRole:"This individual is not a faculty .",
      userDelete:"The user has been not deleted successfully.",
      otp:"The otp has not send successfully.",
      otpVerify:"The otp not successfully verified.",
      otpTime:"The otp has not send successfully. wait some time",
    },
  },
};



