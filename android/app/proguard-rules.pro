# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native proguard rules
-keepclassmembers,allowobfuscation class * {
  @com.facebook.proguard.annotations.DoNotStrip *;
  @com.facebook.common.internal.DoNotStrip *;
}

-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Reanimated kuralları
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Hermes engine kuralları
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.flipper.** { *; }

# Kullanılan third-party kütüphanelerin kuralları
-keep class com.facebook.react.** { *; }
-keep class com.facebook.soloader.** { *; }

# Gereksiz log'ları kaldır
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Unused code elimination
-allowaccessmodification
-repackageclasses
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
