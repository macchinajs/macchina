import fs   from 'fs'
import Handlebars from 'handlebars'
import path from "path"

import {
  getDirectories,
  createDirIfNone,
  copyFolder
} from '../services/fileUtils.js'


// utils
///////////////////////////////////////////////////////////////////////////////
const toGQLType = (inputType) => {
  switch (inputType) {
    case 'Id':
      return 'ID'
    case 'Mixed':
      return 'Mixed'
    case 'Decimal128':
      return 'Float'
    default:
      return inputType
  }
}

const toMongooseType = (inputType) => {
  switch (inputType) {
    case 'Id':
      return 'mongoose.Schema.Types.ObjectId'
    case 'Mixed':
      return 'mongoose.Schema.Types.Mixed'
    case 'Decimal128':
      return 'mongoose.Schema.Types.Decimal128'
    default:
      return inputType
  }
}


const parseType = (value) => {
  if (typeof(value) == 'object') {
    return '['+toMongooseType(value[0])+']'
  } else if (typeof(value) == 'string') {
    return toMongooseType(value)
  }
}

const parseTypeGQL = (value) => {
  if (typeof(value) == 'object') {
    return '['+toGQLType(value[0])+']'
  } else if (typeof(value) == 'string') {
    return toGQLType(value)
  }
}


const parseValidations = (value, validationTemplate=false, nested=false) => {
  let res = ''
  let padding = ''
  if (nested) {
    padding += '  '
  }

  for (let i=0; i<value.length; i++) {
    const validationEntries = value[i]
    let keys = Object.keys(validationEntries)

    for (let entry in validationEntries) {
      // console.log('ENTRY@:', entry)
      switch (entry) {
        case 'def':
          res += 'default: '+JSON.stringify(validationEntries['default'])
          break
        default:
          res += entry+': '+JSON.stringify(validationEntries[entry])
          break
      }

      if (entry != keys.slice(-1)[0]) {
        res += ',\n      '
      } else {
        // console.log(res)
      }
    }
    // console.log('res:', res)
    if (i != value.length-1) {
      res += '\n'+padding+'    }), validate({\n      '
    } else {
      if (validationTemplate) {
        res += '\n'+padding+'  })],'
      } else {
        res += '\n'+padding+'    })]'
      }
    }
  }

  return res
}

const isRequired = (keys, value) => {
  // console.log('keys:', keys, keys.includes('required'), value['required'])
  let hasRequired = (keys.includes('required'))
  if (hasRequired) {
    if (typeof(value['required'])=='object') {
      hasRequired = value['required'][0]
      if (typeof(hasRequired)=='boolean') {
        return true
      } else {
        return false
      }
    }

    if (typeof(value['required'])=='boolean') {
      // console.log("IS BOOL", value['required'])
      hasRequired = value['required']
    } else {
      hasRequired = false
    }
  }
  return hasRequired
}

const getEntryValidationResult = (value, nested) => {
  let keys = Object.keys(value)
  let res = ''

  let padding = ''
  if (nested) {
    padding = '  '
  }

  for (let entry in value) {
    // console.log('ent:', entry)
    entry = entry.trim()
    if (entry === 'default')
      entry = 'def'

    switch (entry) {
      case 'validations':
        res += 'validate({\n      '+padding+parseValidations(value[entry], true, true)
        break
      default:
        continue
    }

    if (entry != keys.slice(-1)[0]) {
      res += ',\n      ' + padding
    } else {
      // console.log('last')
    }
    // console.log('res:', res)
  }

  return res
}

// helpers
///////////////////////////////////////////////////////////////////////////////
Handlebars.registerHelper('buildSchemas_parseValidationEntry', function (value) {
  let res = ''
  let keys = Object.keys(value)

  if (isRequired(keys,value)) {
    if (!value['validations']) {
      value['validations'] = []
    }

    if (value['validations'] && typeof(value['validations']=='object')) {
      if (typeof(value['required'])=='object') {
        const msg = value['required'][1]
        value['validations'].push({
          validator: 'required',
          message: msg
        })
      } else {
        value['validations'].push({
          validator: 'required'
        })
      }
    }
  }
  keys = Object.keys(value)

  let nested = false
  if (!keys.includes('validations')) {
    nested = true
  }

  if (keys.length == 0) {
    return ''
  }

  if (nested) {
    res += ''
    for (let key of keys) {
      const newval = value[key]
      let hasVal = Object.keys(newval).includes('validations')
      if (!hasVal) {
        continue
      }
      // console.log('key', key)
      res += key + ': [\n'
      res += '      '
      res += getEntryValidationResult(newval, nested)
    }
  } else {
    res += getEntryValidationResult(value, nested)
  }

  return res
});

Handlebars.registerHelper('buildSchemas_isRequired', function (data) {
  const required = data['required']
  if (required) {
    if (typeof required == 'boolean') {
      return required
    } else {
      if (Array.isArray(required) && typeof required[0] == 'boolean') {
        return required[0]
      } else {
        return false
      }
    }

  } else {
    return false
  }
});

const parseValidation = (value, aux, indentation=2) => {
  // console.log("IN:", indentation)
  let baseindent = " ".repeat(indentation)
  let res = ''

  let keys = []
  try {
    keys = Object.keys(value)

    if (keys.length == 0) {
      return ''
    }
  } catch(e) {
    return ''
  }

  for (let entry in value) {
    // console.log("ENTRY:", entry, value[entry], typeof(value[entry]))
    entry = entry.trim()
    if (entry === 'default')
      entry = 'def'

    if (typeof(value[entry]) == 'object' && !Array.isArray(value[entry])) {
      res += entry+': {\n'.concat(baseindent, '  ')+parseValidation(value[entry], null, indentation + 2)
      res += '\n'.concat(baseindent, '},\n',baseindent)
      continue
    }

    switch (entry) {
      case 'validations':
        res += entry+': '+JSON.stringify(value[entry])
        break
      default:
        continue
    }

    if (entry != keys.slice(-1)[0]) {
      res += ',\n'.concat(baseindent)
    } else {
      // console.log('last')
    }
    // console.log('res:', res)
  }
  return res
}
Handlebars.registerHelper('buildSchemas_parseValidation', parseValidation);

Handlebars.registerHelper('buildSchemas_hasValidationEntries', function (value) {
  let keys = Object.keys(value)

  let hasVal = keys.includes('validations')

  if (hasVal)
    return true

  for (let key of keys) {
    if (typeof(value[key]) != 'object' || Array.isArray(value[key])) {
      continue
    }
    for (let value2 in value[key]) {
      let keys2 = Object.keys(value[key][value2])
      if (keys2.includes('validations')) {
        hasVal = true
        break
      }
    }

    if (hasVal)
      return true
  }

  // console.log('reqr0:', isRequired(keys, value))
  return (hasVal || isRequired(keys,value))
});

Handlebars.registerHelper('buildSchemas_parseNested', function (values) {
  let res = ''

  if (Array.isArray(values)) {
    values = values[0]
  }

  let k = 0
  let last = false
  for (let basekey in values) {
    if (k == Object.keys(values).length-1) {
      last = true
    }
    k += 1

    let value = values[basekey]
    let keys = Object.keys(value)

    res += basekey+': {\n      '

    if (keys.length == 0) {
      return ''
    }

    for (let entry in value) {
      entry = entry.trim()
      if (entry === 'default')
        entry = 'def'

      switch (entry) {
        case 'type':
          res += entry+': '+parseType(value[entry])
          break
        case 'validations':
          res += 'validate: [validate({\n        '+parseValidations(value[entry])
          break
        case 'ref':
          res += entry+': '+JSON.stringify(value[entry])
          break
        case 'required':
          res += entry+': '+JSON.stringify(value[entry])
          break
        case 'def':
          entry = 'default'
          res += entry+': '+value[entry]
          break
        default:
          if (typeof(value[entry]) == 'object' && value[entry].length == 0) {
            res += entry+': '+JSON.stringify(value[entry])
          } else {
            res += entry+': '+value[entry]
          }
          break
      }

      if (entry != keys.slice(-1)[0]) {
        res += ',\n      '
      } else {
        // console.log('last')
      }
      // console.log('res:', res)
    }
    res += '\n    },\n    '
  }
  return res
});

const parseGQLEntry = (value, aux, indentation=2) => {
  // console.log("IN:", indentation)
  let baseindent = " ".repeat(indentation)
  let res = ''

  let keys = []
  try {
    keys = Object.keys(value)

    if (keys.length == 0) {
      return ''
    }
  } catch(e) {
    return ''
  }

  for (let entry in value) {
    if (entry == 'imports') {
      continue
    }
    // console.log("ENTRY:", entry, value[entry], typeof(value[entry]))
    entry = entry.trim()
    if (entry === 'default')
      entry = 'def'

    if (typeof(value[entry]) == 'object' && !Array.isArray(value[entry])) {
      res += entry+': {\n'.concat(baseindent, '  ')+parseGQLEntry(value[entry], null, indentation + 2)
      res += '\n'.concat(baseindent, '},\n',baseindent)
      continue
    }

    switch (entry) {
      case 'enum':
        res += entry+': '+parseType(value[entry])
        break
      case 'type':
        res += entry+': '+parseType(value[entry])
        break
      case 'validations':
        res += 'validate: [validate({\n      '+parseValidations(value[entry])
        break
      case 'ref':
        res += entry+': '+JSON.stringify(value[entry])
        break
      case 'required':
        res += entry+': '+JSON.stringify(value[entry])
        break
      case 'def':
        entry = 'default'
        res += entry+': '+value[entry]
        break
      default:
        res += entry+': '+value[entry]
        break
    }

    if (entry != keys.slice(-1)[0]) {
      res += ',\n'.concat(baseindent)
    } else {
      // console.log('last')
    }
    // console.log('res:', res)
  }
  return res
}
Handlebars.registerHelper('buildSchemas_parseGQLEntry', parseGQLEntry);

const parseEntry = (value, aux, indentation=2) => {
  // console.log("IN:", indentation)
  let baseindent = " ".repeat(indentation)
  let res = ''

  let keys = []
  try {
    keys = Object.keys(value)

    if (keys.length == 0) {
      return ''
    }
  } catch(e) {
    return ''
  }

  for (let entry in value) {
    if (entry == 'imports') {
      continue
    }
    // console.log("ENTRY:", entry, value[entry], typeof(value[entry]))
    entry = entry.trim()
    if (entry === 'default')
      entry = 'def'

    if (typeof(value[entry]) == 'object' && !Array.isArray(value[entry])) {
      res += entry+': {\n'.concat(baseindent, '  ')+parseEntry(value[entry], null, indentation + 2)
      res += '\n'.concat(baseindent, '},\n',baseindent)
      continue
    }

    switch (entry) {
      case 'enum':
        res += entry+': '+parseType(value[entry])
        break
      case 'type':
        res += entry+': '+parseType(value[entry])
        break
      case 'validations':
        res += 'validate: [validate({\n      '+parseValidations(value[entry])
        break
      case 'ref':
        res += entry+': '+JSON.stringify(value[entry])
        break
      case 'required':
        res += entry+': '+JSON.stringify(value[entry])
        break
      case 'def':
        entry = 'default'
        res += entry+': '+value[entry]
        break
      default:
        res += entry+': '+value[entry]
        break
    }

    if (entry != keys.slice(-1)[0]) {
      res += ',\n'.concat(baseindent)
    } else {
      // console.log('last')
    }
    // console.log('res:', res)
  }
  return res
}
Handlebars.registerHelper('buildSchemas_parseEntry', parseEntry);

Handlebars.registerHelper('buildSchemas_parseImports', function (value) {
  let res = ''
  for (let key in value) {
    res += `import ${key} from "${value[key]}"`
  }

  return res
})

Handlebars.registerHelper('buildSchemas_isArray', function (value) {
  return Array.isArray(value)
})

Handlebars.registerHelper('buildSchemas_isNested', function (value) {
  let isNested = false

  try {
    let keys = Object.keys(value.data)
    const innerval = value.data[keys[0]]
    if (typeof(innerval) == 'object') {
      let keys2 = Object.keys(innerval)
      const innerval2 = innerval[keys2[0]]
      if (typeof(innerval2) == 'object') {
        return true
      }
    }
  } catch(e) {
  }


  return false
})

// exports
///////////////////////////////////////////////////////////////////////////////
export default function compileSchemas(schemas, clientBase, serverBase) {
  let mongooseSchemas = {}
  let validationSchemas = {}

  let baseSchema = {}
  if (schemas['_macchinaBase']) {
    if (schemas['_macchinaBase']['Base']) {
      baseSchema = schemas['_macchinaBase']['Base']
    }
    delete schemas['_macchinaBase']
  }

  try {
    for (let modelName in schemas) {
      let schema = schemas[modelName]

      for (let key in schema) {
        if (key == 'imports') {
          continue
        }
        schema[key] = {
          ...baseSchema,
          ...schema[key]
        }
      }

      let file_loc = new URL('../templates/schema.hbs', import.meta.url)
      const schemaTemplate = fs.readFileSync(file_loc, 'utf8');

      let gqlFile = new URL('../templates/GQLschema.hbs', import.meta.url)
      const gqlTemplate = fs.readFileSync(gqlFile, 'utf8');

      file_loc = new URL('../templates/validation.hbs', import.meta.url)
      const validationTemplate = fs.readFileSync(file_loc, 'utf8');

      file_loc = new URL('../templates/model.hbs', import.meta.url)
      const modelTemplate = fs.readFileSync(file_loc, 'utf8');

      createDirIfNone(serverBase+'.macchina/models/'+modelName)
      createDirIfNone(clientBase+'.macchina/models/'+modelName)

      const buildMongoose = Handlebars.compile(schemaTemplate, { noEscape: true });
      const mongooseOut = buildMongoose({name: modelName, imports: schema['imports'], schemaEntries: schema})
      fs.writeFileSync(serverBase+'.macchina/models/'+modelName+'/schema.js', mongooseOut);

      const buildGQL = Handlebars.compile(gqlTemplate, { noEscape: true });
      const gqlOut = buildGQL({name: modelName, imports: schema['imports'], schemaEntries: schema})
      fs.writeFileSync(serverBase+'.macchina/models/'+modelName+'/GQLschema.gql', gqlOut);

      const schemaHooksIn = './models/'+modelName+'/schemaHooks.js'
      const hasHooks = fs.existsSync(schemaHooksIn)
      if (hasHooks)
        fs.copyFileSync(schemaHooksIn,
                        serverBase+'.macchina/models/'+modelName+'/schemaHooks.js')

      const buildModel = Handlebars.compile(modelTemplate, { noEscape: true });
      const modelInput = {name: modelName, hasHooks, schemaEntries: schema}
      const modelOut = buildModel(modelInput)
      fs.writeFileSync(serverBase+'.macchina/models/'+modelName+'/index.js', modelOut);

      const buildValidation = Handlebars.compile(validationTemplate, { noEscape: true });

      if (schema.imports) {
        delete schema.imports
      }
      const validationOut = buildValidation({name: modelName, schemaEntries: schema})
      fs.writeFileSync(serverBase+'.macchina/models/'+modelName+'/validation.js', validationOut);
      fs.writeFileSync(clientBase+'.macchina/models/'+modelName+'/validation.js', validationOut);
    }
  } catch(err) {
    console.log('**ERROR**: Template compilation error:',err)
  }

  return {mongooseSchemas, validationSchemas}
}
