import validate from 'mongoose-validator'

import '$lib/.macchina/shared/lib/extendValidators.js'


// User schema
///////////////////////////////////////////////////////////////////////////////
export const userValidators = {
  username: {
    validations: [{"validator":"isLength","arguments":[3,50],"message":"Name should be between {ARGS[0]} and {ARGS[1]} characters"},{"validator":"isAlphanumeric","passIfEmpty":true,"message":"Name should contain alpha-numeric characters only"}]
  },
  email: {
    validations: [{"validator":"isEmail","message":"Please enter a valid email"},{"validator":"isLength","only":"server","arguments":[4,100],"message":"Email should be between {ARGS[0]} and {ARGS[1]} characters"}]
  },
  password: {
    validations: [{"validator":"isLength","arguments":[8,40],"message":"Password should be between {ARGS[0]} and {ARGS[1]} characters"}]
  },
  imagepath: {
    
  },
  joined: {
    
  },
  verified: {
    
  },
  roles: {
    
  },
  liked: {
    
  },
  messages: {
    
  },
  
}
