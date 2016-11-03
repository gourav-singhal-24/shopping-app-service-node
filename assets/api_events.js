/**
 * API events definitions
 * @type {Object}
 */
module.exports = {

  email_verification: {
    event_code: 'EMAIL_VERIFICATION',
    description: 'A verification code is sent for an email.',
    delivery: ['email'],
    payload: {
      email: 'email being verified',
      code: 'verification code'
    }
  },

  phone_verification: {
    event_code: 'PHONE_VERIFICATION',
    description: 'A verification code is sent for a phone.',
    delivery: ['sms'],
    payload: {
      phone: 'phone being verified',
      code: 'verification code'
    }
  },

  user_registered: {
    event_code: 'USER_REGISTERED',
    description: 'A new user has registered. This is a welcome message.',
    delivery: ['email'],
    payload: {
      name: 'full name of user'
    }
  },

  password_reset: {
    event_code: 'PASSWORD_RESET',
    description: 'A user password has been reset.',
    delivery: ['email'],
    payload: {
      password: 'New generated password'
    }
  },

  new_post: {
    event_code: 'NEW_POST',
    description: 'A post has been created by a user',
    delivery: ['push', 'socket'],
    payload: {
      user_name: 'creating user name',
      user_id: 'creating user id',
      post_id: 'post id',
      post_type: 'post type'
    }
  },

  new_comment: {
    event_code: 'NEW_COMMENT',
    description: 'A new comment has been posted by a user on a post',
    delivery: ['push', 'socket'],
    payload: {
      user_name: 'commenting user name',
      user_id: 'commenting user id',
      post_id: 'post id',
      post_type: 'post type',
      post_author_name: 'Post creator user name',
      post_author_id: 'Post creator user id'
    }
  },

  new_connect_request: {
    event_code: 'NEW_CONNECT_REQUEST',
    description: 'A connect request has been sent by a user to another user',
    delivery: ['push', 'email'],
    payload: {
      user_name: 'Sending user name',
      user_id: 'Sending user ID',
      to_user_name: 'Receiver user name',
      to_user_id: 'Receiver user id',
      timestamp: 'Date time'
    }
  },

  connected: {
    event_code: 'CONNECTED',
    description: 'A user is now connected to another user',
    delivery: ['push'],
    payload: {
      user_name: 'Connected user name',
      user_id: 'Connected user id',
      to_user_name: 'Connected to user name',
      to_user_id: 'Connected to user id',
      timestamp: 'Date time'
    }
  }
};
