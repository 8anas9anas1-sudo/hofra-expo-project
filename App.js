import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [htmlUri, setHtmlUri] = useState(null);
  const webviewRef = React.useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    (async () => {
      // نحمّل ملف اللعبة كـ asset محلي (كل الصور/الأصوات مضمّنة داخله أصلاً base64،
      // فما تحتاج أي ملفات ثانية أو اتصال إنترنت وقت التشغيل)
      const asset = Asset.fromModule(require('./assets/hofra.html'));
      await asset.downloadAsync();
      setHtmlUri(asset.localUri || asset.uri);
      await SplashScreen.hideAsync().catch(() => {});
    })();
  }, []);

  useEffect(() => {
    // زر الرجوع بالأندرويد يرجع داخل اللعبة (لو فيه محتوى) بدل ما يقفل التطبيق فجأة
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  if (!htmlUri) return null;

  return (
    <>
      <StatusBar hidden />
      <WebView
        ref={webviewRef}
        source={{ uri: htmlUri }}
        style={styles.webview}
        originWhitelist={['*']}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: '#150d07' },
});
