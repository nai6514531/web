let storage = {}

storage.val = ( key, val ) => {
    if ( val ) {
        let dataCache = JSON.parse( localStorage[ '_adminDataCache' ] || '{}' )
        dataCache[ key ] = val
        localStorage[ '_adminDataCache' ] = JSON.stringify( dataCache )
    } else {
        let dataCache = JSON.parse( localStorage['_adminDataCache'] || '{}' )
        return dataCache[key] || null
    }
}

storage.clear = ( key ) => {
    if ( key ) {
        let dataCache = JSON.parse( localStorage[ '_adminDataCache' ] || '{}' )
        delete dataCache[ key ]
        localStorage[ '_adminDataCache' ] = JSON.stringify( dataCache )
    } else {
        localStorage[ '_adminDataCache' ] = JSON.stringify( {} )
    }
}

export default storage
