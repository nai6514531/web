const storage = {}
const session = {}
storage.val = ( key, val ) => {
    if ( val !== undefined ) {
        let dataCache = JSON.parse( localStorage[ '_adminLocalCache' ] || '{}' )
        dataCache[ key ] = val
        localStorage[ '_adminLocalCache' ] = JSON.stringify( dataCache )
    } else {
        let dataCache = JSON.parse( localStorage['_adminLocalCache'] || '{}' )
        return dataCache[key] || null
    }
}

storage.clear = ( key ) => {
    if ( key ) {
        let dataCache = JSON.parse( localStorage[ '_adminLocalCache' ] || '{}' )
        delete dataCache[ key ]
        localStorage[ '_adminLocalCache' ] = JSON.stringify( dataCache )
    } else {
        localStorage[ '_adminLocalCache' ] = JSON.stringify( {} )
    }
}

session.val = ( key, val ) => {
    if ( val !== undefined ) {
        let dataCache = JSON.parse( sessionStorage.getItem('_adminSessionCache') || '{}' )
        dataCache[ key ] = val
        sessionStorage.setItem('_adminSessionCache',JSON.stringify( dataCache ))
    } else {
        let dataCache = JSON.parse( sessionStorage.getItem('_adminSessionCache') || '{}' )
        return dataCache[key] || null
    }
}

session.clear = ( key ) => {
    if ( key ) {
        sessionStorage.removeItem(key)
    } else {
        sessionStorage.clear()
    }
}

export { storage, session }
