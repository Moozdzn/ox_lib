--- Creates a new cache object
--- @param refresh_fn fun(...): any The function to call to refresh the cache
--- @param ttl number? time to live in ms
--- @param cacheImmediately boolean? whether to cache immediately or not
--- @return table cache Retrieve the value with cache.value
function lib.redis(refresh_fn, ttl, cacheImmediately)
    if not refresh_fn then
        error("No callback function provided")
    end

    if not ttl then
        ttl = 60000
    end

    if cacheImmediately == nil then
        cacheImmediately = true
    end

    local cached = {
        ttl = ttl,
        refresh_func = refresh_fn,
        time = cacheImmediately and GetGameTimer() or 0,
        value = cacheImmediately and refresh_fn(),
    }

    local proxy = setmetatable({}, {
        __index = function(_, k)
            if k == "value" then
                if GetGameTimer() - cached.time > cached.ttl then
                    cached.value = cached.refresh_func()
                    cached.time = GetGameTimer()
                end
                return cached.value
            end
            return cached[k]
        end,
        __newindex = function(_, k, v)
            if k == "value" then
                cached.value = v
                cached.time = GetGameTimer()
            else
                cached[k] = v
            end
        end,
    })

    return proxy
end

return lib.redis