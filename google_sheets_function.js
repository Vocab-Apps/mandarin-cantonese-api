// uses API and python module from https://github.com/lucwastiaux/python-pinyin-jyutping-sentence


/**
 * @fileoverview Provides custom functions PINYIN and JYUTPING.
 * @OnlyCurrentDoc
 */

/**
 * Runs when the add-on is installed.
 */
 function onInstall() {
  onOpen();
}

function onOpen() {
  set_user_uuid();
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Use in this spreadsheet', 'use')
      .addItem('Show Help', 'showSidebar')
      .addToUi();
  showSidebar();
}

function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('sidebar.html').setTitle('Mandarin/Cantonese Pinyin/Jyutping');
  SpreadsheetApp.getUi().showSidebar(html);
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


function get_user_uuid_key() {
  return 'USER_UUID';
}

function set_user_uuid() {
  var userProperties = PropertiesService.getUserProperties();
  var user_uuid = userProperties.getProperty(get_user_uuid_key());
  if (user_uuid == undefined) {
    user_uuid = Utilities.getUuid();
    userProperties.setProperty(get_user_uuid_key(), user_uuid);
  }  
}

function get_user_uuid() {
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
}

function get_cache_key(source_text, conversion, tone_numbers, spaces) {
  return 'cache_' + source_text + '_' + conversion + '_tone_numbers_' + tone_numbers + '_spaces_' + spaces;
}

function call_api(input_array, format, tone_numbers, spaces) {
  var url = 'https://api-prod.mandarincantonese.com/batch';  

  var cache = CacheService.getDocumentCache();

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
      'addon_version': 'v24'
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
  var result_entries = call_api(input_array, format, tone_numbers, spaces);
  return result_entries[0];
}


function convert(input, format, tone_numbers, spaces) {
  tone_numbers = tone_numbers || false;
  spaces = spaces || false;
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

