export function getErrors(formInput, validators) {
  let errorMsgs = {}
  for (let label in validators) {
    for (let idx=0; idx < validators[label].length; idx+=1) {
      let {message, validator} = validators[label][idx]
      if (Array.isArray(formInput[label])) {
        for (let item of formInput[label]) {
          const isValid = validator(item)
          if (!isValid) {
            errorMsgs[label] = `${item}: ${message}`
            break
          }
        }
      } else {
        const isValid = validator(formInput[label])
        if (!isValid) {
          errorMsgs[label] = message
          break
        }
      }
    }
  }
  return errorMsgs
}
