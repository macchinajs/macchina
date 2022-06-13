import validate from 'mongoose-validator'

import '$lib/.macchina/shared/lib/extendValidators.js'


// Comment schema
///////////////////////////////////////////////////////////////////////////////
export const commentValidators = {
  body: {
    validations: [{"validator":"isLength","arguments":[3,500],"message":"Comment should be between {ARGS[0]} and {ARGS[1]} characters"}]
  },
  created: {
    
  },
  edited: {
    
  },
  deleted: {
    
  },
  author: {
    
  },
  post: {
    
  },
  
}
