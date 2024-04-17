

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
      studentList: "The list has been retrieved successfully.",
      userDelete:"The user has been deleted successfully.",
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
      fillDetails: "Please provide user details.",
      uploadImage: "Image upload unsuccessful",
      password: "Your password should be between 6-20 characters!",
      delete: "The details of the user were not deleted.",
      update: "User Data not updated successfully",
      leaveRequest: "Leave request not send successfully",
      leaveStatus:"Leave already approved or rejected",
      leaveStatusError:"You can not change leave status ",
      leaveRequestLimit:"already request for leave 2 times wait for leave approval",
      studentList: "The student list has not retrieved successfully.",
      studentUpdateRole:"This user is not a student",
      hodUpdateRole:"This user is not a hod",
      facultyUpdateRole:"This user is not a faculty",
      userDelete:"The user has been not deleted successfully.",
    },
  },
};



// module.exports = {
//   bookMassage: {
//     success: {
//       add: "The book has been successfully created.",
//       fetch: "The book has been retrieved successfully.",
//       update: "The book has been successfully updated.",
//       delete: "The book has been deleted successfully.",
//     },
//     error: {
//       add: "The book could not be listed successfully.",
//       update: "The details of the book have not been updated.",
//       delete: "The details of the book were not deleted.",
//       notFound: "We could not find the book you are looking for.",
//       fillDetails: "Please provide the details of the book.",
//       genericError: "An error occurred. please try again later.",
//       year: "Year field must be at most the current year",
//     },
//   },
//   userMassage: {
//     success: {
//       signUpSuccess: "The user has successfully signed up.",
//       loginSuccess: "The user has been successfully logged in.",
//       profileRetrieved: "The user profile has been successfully retrieved.",
//       delete:"User and associated books deleted successfully",
//     },
//     error: {
//       unauthorized: "Unauthorized - invalid token",
//       tokenMissing: "Unauthorized - token missing",
//       invalidCredentials: "Invalid credentials",
//       userNotFound: "User not found",
//       genericError: "An error occurred. please try again later.",
//       signUperror: "The user sign-up process was unsuccessful.",
//       passwordNotMatch: "The password and confirm password do not match.",
//       invalidEmail:
//         "There is already a user registered with this email address.",
//       wrongPassword: "Wrong password",
//       fillDetails: "Please provide user details.",
//       uploadImage: "Image upload unsuccessful",
//       password: "Your password should be between 6-20 characters!",
//       delete: "The details of the user were not deleted.",
//     },
//   },
// };
