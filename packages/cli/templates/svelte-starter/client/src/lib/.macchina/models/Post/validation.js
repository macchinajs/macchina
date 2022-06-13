import validate from 'mongoose-validator'

import '$lib/.macchina/shared/lib/extendValidators.js'


// Post schema
///////////////////////////////////////////////////////////////////////////////
export const postValidators = {
  title: {
    validations: [{"validator":"isLength","arguments":[3,120],"message":"Title should be between {ARGS[0]} and {ARGS[1]} characters"}]
  },
  body: {
    validations: [{"validator":"isLength","arguments":[10,100000],"message":"Post body should be between {ARGS[0]} and {ARGS[1]} characters"}]
  },
  image: {
    
  },
  slug: {
    
  },
  author: {
    
  },
  edited: {
    
  },
  created: {
    
  },
  state: {
    
  },
  liked: {
    
  },
  comments: {
    
  },
  
}
