
export class umeng {

    static startLevel(level: string) {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            return jsb.reflection.callStaticMethod("Umeng", "startLevel:", level);
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod('com/game/sdk/Umeng', 'startLevel', '(Ljava/lang/String;)V', level);
        }
    }

    static finishLevel(level: string) {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            return jsb.reflection.callStaticMethod("Umeng", "finishLevel:", level);
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod('com/game/sdk/Umeng', 'finishLevel', '(Ljava/lang/String;)V', level);
        }
    }

    static failLevel(level: string) {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            return jsb.reflection.callStaticMethod("Umeng", "failLevel:", level);
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod('com/game/sdk/Umeng', 'failLevel', '(Ljava/lang/String;)V', level);
        }
    }

    static onEvent(eventName: string, status: String) {
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            return jsb.reflection.callStaticMethod("Umeng", "onEvent:status:", eventName, status);
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod('com/game/sdk/Umeng', 'onEvent', '(Ljava/lang/String;Ljava/lang/String;)V', eventName, status);
        }
    }
}