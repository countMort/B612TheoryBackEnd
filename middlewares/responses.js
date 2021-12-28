let error = (status, extensions) => {
    let errors = {
        '401': 'نیاز به ورود به حساب کاربری',
        '403': 'عدم دسترسی',
        '404': `${extensions.join('،')} یافت نشد.`,
        '415': `نوع داده ارسالی صحیح نمی‌باشد <br> فرمت پشتیبانی شده: <br> ${extensions.join('،')}`
    }
    return errors[status]
}

let success = (status = 200, extensions) => {
    let successes = {
        '200': extensions.join('،'),
        '201': `${extensions.join('،')} با موفقیت ایجاد شد${extensions.length > 1 ? 'ند' : ''}.`,
        '202': `${extensions.join('،')} با موفقیت حذف شد${extensions.length > 1 ? 'ند' : ''}.`,
        '204': `${extensions.join('،')} با موفقیت بروزرسانی شد${extensions.length > 1 ? 'ند' : ''}.`,
    }
    return successes[status]
}

let responses = (res, status, extensions = [''], results) => {
    let response = {}
    if (status >= 400 && status < 500) {
        response.message = error(status, extensions)
        response.success = false
        console.log(extensions[0]);
    } else if (status == 500) {
        console.trace(extensions[0])
        response.message = extensions[0]
        response.success = false
    } else if (status >= 200 && status < 300) {
        response.message = success(status, extensions)
        response.success = true
        response.result = results
    }
    return res.status(status).json(response)
}

module.exports = responses
