import C from '../../constants.js'

// schema
///////////////////////////////////////////////////////////////////////////////
export default {
  username: {
    type     : String,
    unique   : false,
    validations: [{
      validator: 'required',
      message: 'Usename is required.',
    },{
      validator: 'isLength',
      arguments: [3, 50],
      message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters',
    },{
      validator: 'isAlphanumeric',
      passIfEmpty: true,
      message: 'Name should contain alpha-numeric characters only',
    }]
  },
  email   : {
    type    : String,
    unique  : true,
    lowercase: true,
    trim    : true,
    required: true,
    validations: [{
      validator: 'isEmail',
      message: 'Please enter a valid email'
    }],
  },
  password: {
    type    : String,
    trim    : true,
    required: true,
    validations: [{
      validator: 'isLength',
      arguments: [8, 40],
      message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters',
    }]
  },
  joined  : {
    type: Date,
    required: true,
    default: Date.now
  },
  verified  : {
    type: Boolean,
    required: true,
    default: false
  },
  roles  : {
    type: [String],
    required: true,
    default: [C.ROLES.USER]
  },
  liked: {
    type: ['id'],
    required: true,
    default: [],
    ref: 'Post'
  },
  messages: {
    type: ['id'],
    required: true,
    default: [],
    ref: 'Message'
  }
}

