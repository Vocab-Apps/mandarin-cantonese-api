// uses API and python module from https://github.com/lucwastiaux/python-pinyin-jyutping-sentence


/**
 * @fileoverview Provides custom functions PINYIN and JYUTPING.
 * @OnlyCurrentDoc
 */

function getAddonVersion() {
  const PINYIN_ADDON_VERSION = 'v44';
  return PINYIN_ADDON_VERSION;
}

/**
 * Runs when the add-on is installed.
 */
 function onInstall() {
  onOpen();
}

function onOpen() {
  // console.log('onOnpen');
  // disable temporarily, to clear errors on log
  set_require_email_registration();    
  set_user_uuid();
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Use in this spreadsheet', 'use')
      .addItem('Show Help', 'showSidebar')
      .addItem('Register by email', 'show_register_email_prompt')
      .addItem('Show debug data', 'debug_data')
      .addToUi();
  showSidebar();
}

function showSidebar() {
  try {
    var html = HtmlService.createHtmlOutputFromFile('sidebar.html').setTitle('Mandarin/Cantonese Pinyin/Jyutping');
    SpreadsheetApp.getUi().showSidebar(html);
  } catch (e) {
    // console.warn('showSidebar() error: ' + e);
  }  
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_debug_data_str()
{
  try {
    var userProperties = PropertiesService.getUserProperties();

    // get user properties
    const data = userProperties.getProperties();
    const user_properties_str = JSON.stringify(data);

    // now, try to write a property
    const randomNumber = generateRandomNumber(1, 100);
    const testProperty = 'testProperty_' + randomNumber;
    userProperties.setProperty('TEST_PROPERTY', testProperty);
    // ensure that the property was written
    const testPropertyRead = userProperties.getProperty('TEST_PROPERTY');
    const propertyWriteSuccessful = testPropertyRead == testProperty;

    const debugData = 'User Properties: ' + user_properties_str +
    ' [Write Property Test: ' + propertyWriteSuccessful + '] ' +
    ' [Require Email Registration: ' + get_require_email_registration() + '] ' +
    ' [Email Registration Done: ' + email_registration_done() + '] ' +
    ' [Addon Version: ' + getAddonVersion() + '] ';

    return debugData;
  } catch (e) {
    const debugDataError = 'error getting debug data: ' + e;
    return debugDataError;
  }  
}

function debug_data() {
  try {
    const debugData = get_debug_data_str();
    var ui = SpreadsheetApp.getUi();
    ui.alert('Debug Data', debugData, ui.ButtonSet.OK);
  } catch (e) {
    console.error('debug_data(): ' + e);
    ui.alert('Debug Data Error', 'error getting debug data: ' + e, ui.ButtonSet.OK);
  }
}

function clear_data() {
  PropertiesService.getUserProperties().deleteProperty('REQUIRE_EMAIL_REGISTRATION');
  PropertiesService.getUserProperties().deleteProperty('INSTALL_TIMESTAMP');
  PropertiesService.getUserProperties().deleteProperty('EMAIL_REGISTRATION_DONE');
}

function use() {
  
  var jyutping_input = '你好';
  var jyutping_output = jyutping(jyutping_input);
  
  var pinyin_input = '你好';
  var pinyin_output = pinyin(pinyin_input);
  
  var title = 'Mandarin Cantonese Tools';
  var message = 'The functions PINYIN and JYUTPING are now available in ' +
      'this spreadsheet. '+ 
      ' =PINYIN(\'' + pinyin_input + '\') should return \'' + pinyin_output + '\'' +
      ' =JYUTPING(\'' + jyutping_input + '\') should return \'' + jyutping_output + '\'' +
      ' More information is available in the function help ' +
      'box. Please type =PINYIN() or =JYUTPING() to see more information.';
  var ui = SpreadsheetApp.getUi();
  ui.alert(title, message, ui.ButtonSet.OK);
}

function flatten_array(entry) {
  return entry[0];
}

function wrap_array(entry) {
  return [entry];
}

function to_string(entry) {
  return entry.toString();
}


function show_register_email_prompt() {
  var ui = SpreadsheetApp.getUi(); // Same variations.

  var result = ui.prompt(
      'Register by email',
      'Please enter your email.\nOnce done, you will have unlimited access to this addon.',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var text = result.getResponseText();

  if (button == ui.Button.OK) {
    // User clicked "OK".

    var url = 'https://api-prod.mandarincantonese.com/register_email'; 

    var data = {
      'email': text
    };
    //console.log(data);
    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      'payload' : JSON.stringify(data),
      'muteHttpExceptions': true
    };
    
    var response = UrlFetchApp.fetch(url, options);  

    if (response.getResponseCode() != 200) {
      var result_data = JSON.parse(response);    
      var error = result_data['error'];
      ui.alert(error);
    } else {
      set_email_registration_done(text);
      ui.alert('Thank you for registering!\nYou can now continue to use the MandarinCantonese Pinyin Addon!\nYou may need to remove and re-add the PINYIN formulas.');
    }
  } 
}


function get_user_uuid_key() {
  return 'USER_UUID';
}

function get_current_timestamp() {
  const now = new Date();
  const install_timestamp = now.getTime();
  return install_timestamp;
}

function set_require_email_registration() {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('REQUIRE_EMAIL_REGISTRATION', true);
    if (userProperties.getProperty('INSTALL_TIMESTAMP') == null) {
      userProperties.setProperty('INSTALL_TIMESTAMP', get_current_timestamp());
    }
  } catch (e) {
    // console.warn('set_require_email_registration(): ' + e);
  }  
}

function require_email_registration() {
  var require_registration = PropertiesService.getUserProperties().getProperty('REQUIRE_EMAIL_REGISTRATION');
  if (require_registration === null || require_registration === "false") {
    return false;
  }
  return true;
}

function email_registration_done() {
  // Check if registration is already done
  var registrationDone = PropertiesService.getUserProperties().getProperty('EMAIL_REGISTRATION_DONE');
  if (registrationDone && registrationDone === "true") {
    //console.log('email registration already done');
    return true;
  }
  // email registration not done
  return false;
}

function get_require_email_registration() {
  try {  
    if (! require_email_registration())
    {
      // email registration not required
      return false;
    }

    if (email_registration_done())
    {
      // email registration already done
      return false;
    }

    const timestamp_diff = get_current_timestamp() - PropertiesService.getUserProperties().getProperty('INSTALL_TIMESTAMP');
    if (require_email_registration() && timestamp_diff > 86400*1000) {
      // console.log('timestamp_diff: ', timestamp_diff);
      return true
    }
  } catch (e) {
    console.warn('get_require_email_registration(): ' + e);
  }    
  // default to false, for example if user properties are disabled
  return false;
}

function set_email_registration_done(email) {
  try {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('EMAIL_REGISTRATION_DONE', true);
    userProperties.setProperty(get_user_uuid_key(), email);
  } catch (e) {
    console.error('set_email_registration_done(): ' + e);
  }   
}

function get_email_registration_done() {
  var userProperties = PropertiesService.getUserProperties();
  email_registration_done = userProperties.getProperty('EMAIL_REGISTRATION_DONE');
  if (email_registration_done == null) {
    return false;
  }
  return true;
}

function set_user_uuid() {
  try {  
    var userProperties = PropertiesService.getUserProperties();
    var user_uuid = userProperties.getProperty(get_user_uuid_key());
    if (user_uuid == undefined) {
      user_uuid = Utilities.getUuid();
      userProperties.setProperty(get_user_uuid_key(), user_uuid);
    }  
  } catch (e) {
    // console.warn('set_user_uuid(): ' + e);
  }    
}

function get_user_uuid() {
  try {    
    var userProperties = PropertiesService.getUserProperties();
    var user_uuid = userProperties.getProperty(get_user_uuid_key());
    if (user_uuid == undefined) {
      // for some users, we're unable to set user properties, use cache instead
      var user_cache = CacheService.getUserCache();
      user_uuid = user_cache.get(get_user_uuid_key());
      if (user_uuid == undefined) {
        user_uuid = Utilities.getUuid();
        user_cache.put(get_user_uuid_key(), user_uuid, 21600);
      }
    }
    return user_uuid;
  } catch (e) {
    console.warn('get_user_uuid(): ' + e);
  }    
  return 'unknown';
}

function get_cache_key(source_text, conversion, tone_numbers, spaces) {
  return 'cache_' + source_text + '_' + conversion + '_tone_numbers_' + tone_numbers + '_spaces_' + spaces;
}

function call_api(input_array, format, tone_numbers, spaces) {
  var url = 'https://api-prod.mandarincantonese.com/batch';  

  const require_registration = get_require_email_registration();
  if (require_registration) {
    return ['Register to continue using this addon, Menu Extensions -> Mandarin Cantonese Tools -> Register by email [debug]: ' + get_debug_data_str()];
  }

  var cache = CacheService.getDocumentCache();

  // do some sanity checks on all entries
  var max_rows = 1000;
  if (input_array.length > max_rows) {
    var error_message = 'Error: too many rows, maximum ' + max_rows + ' rows';
    console.warn('call_api: ' + error_message);
    return [error_message];
  }
  
  var max_characters = 100;
  for (var i = 0; i < input_array.length; i++) {
    var entry = input_array[i];
    if (entry.length > max_characters) {
      var error_message = 'Error: input at row ' + i  + ' too long, maximum ' + max_characters + ' characters (' + entry + ')';
      console.warn('call_api: ' + error_message);
      return [error_message];
    }
  }

  var cached_entries = [];
  for (var i = 0; i < input_array.length; i++) {
    var cache_key = get_cache_key(input_array[i], format, tone_numbers, spaces);
    var cached_result = cache.get(cache_key);
    if (cached_result != null) {
      cached_entries.push(cached_result);
    } else {
      break; // don't keep looking, just look at the beginning
    }
  }

  // retain entries which start after cached_entries.length.
  // everything before was available in cache, we just need to query the rest
  var query_array = input_array.slice(cached_entries.length);
  // console.log('cached_entries: ', cached_entries);
  // console.log('query_array: ', query_array);
  
  if (query_array.length > 0) {
    var data = {
      'conversion': format,
      'tone_numbers': tone_numbers,
      'spaces': spaces,
      'entries': query_array,
      'user_uuid': get_user_uuid(),
      'addon_version': getAddonVersion()
    };
    //console.log(data);
    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      'payload' : JSON.stringify(data)
    };
    
    var response = UrlFetchApp.fetch(url, options);  
    var result_data = JSON.parse(response);
    
    var result_entries = result_data['result'];  
    // console.log('queried for ', result_entries.length, ' entries');
  } else {
    // no need to query anything
    var result_entries = [];
    // console.log('all results cached, not querying anything');
  }

  // place result into cache
  for (var i = 0; i < result_entries.length; i++) {
    var query_text = query_array[i];
    var result_text = result_entries[i];
    var result_cache_key = get_cache_key(query_text, format, tone_numbers, spaces);
    cache.put(result_cache_key, result_text, 21600);
  }

  // combine cached array and result entries
  var final_result = cached_entries.concat(result_entries);
  return final_result;
}

function chinese_convert_batch(input, format, tone_numbers, spaces) {
  var input_array = input.map(flatten_array);
  input_array = input_array.map(to_string);
  
  // skip rows at the bottom which don't have a value
  var lastNonEmpty = 0;
  for(var i = 0; i < input_array.length; i++)
  {
    var entry = input_array[i];
    if (entry.length > 0) {
      lastNonEmpty = i;
    }
  }
  
  var input_array = input_array.slice(0, lastNonEmpty+1);
  var result_entries = call_api(input_array, format, tone_numbers, spaces);
  return result_entries.map(wrap_array);
}

function chinese_convert_single(input, format, tone_numbers, spaces) {
  input = to_string(input);
  var input_array = [input];
  try {
    var result_entries = call_api(input_array, format, tone_numbers, spaces);
    return result_entries[0];
  } catch (e) {
    if (e.toString().indexOf("Service invoked too many times") !== -1) {
      var error_message = "Error: exceeded Google rate limit, please use Batch mode instead, see Menu Extensions -> Mandarin Cantonese Tools -> Show Help";
      console.warn('chinese_convert_single: ' + error_message);
      return error_message;
    } else {
      console.error('chinese_convert_single: ' + e);
    }
    return "Error: " + e.toString();
  }    
}


function convert(input, format, tone_numbers, spaces) {
  tone_numbers = tone_numbers || false;
  spaces = spaces || false;
  if (input === undefined || input === null) 
  {
    var error_message = 'Error: no input provided';
    console.warn('convert: ' + error_message);
    return error_message;
  }
  if( input.map ) {
    return chinese_convert_batch(input, format, tone_numbers, spaces);
  } else {
    return chinese_convert_single(input, format, tone_numbers, spaces);
  }  
}

/**
 * Convert Traditional Chinese text to Jyutping
 *
 * @param {string} input - the value or cell containing Traditional Chinese text. Single cell (A1) or range (A:A) accepted. Using a range is much faster.
 * @param {boolean} tone_numbers - specify TRUE to use tone numbers instead of diacritics (FALSE otherwise).
 * @param {boolean} spaces - specify TRUE to use a space between each syllable (FALSE otherwise).
 * @return Jyutping text
 * @customfunction
 */
function jyutping(input, tone_numbers, spaces) {
  return convert(input, "jyutping", tone_numbers, spaces);
}

/**
 * Convert Simplified Chinese text to Pinyin
 *
 * @param {string} input - the value or cell containing Simplified Chinese text. Single cell (A1) or range (A:A) accepted. Using a range is much faster.
 * @param {boolean} tone_numbers - specify TRUE to use tone numbers instead of diacritics (FALSE otherwise).
 * @param {boolean} spaces - specify TRUE to use a space between each syllable (FALSE otherwise).
 * @return Pinyin text
 * @customfunction
 */
function pinyin(input, tone_numbers, spaces) {
  return convert(input, "pinyin", tone_numbers, spaces);
}

