import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

const String kHomeUrl = 'https://godscake-pied.vercel.app/';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const GodsCakeApp());
}

class GodsCakeApp extends StatelessWidget {
  const GodsCakeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Gods Cake',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFF24A61),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFFFF7F2),
        useMaterial3: true,
      ),
      home: const GodsCakeWebViewScreen(),
    );
  }
}

class GodsCakeWebViewScreen extends StatefulWidget {
  const GodsCakeWebViewScreen({super.key});

  @override
  State<GodsCakeWebViewScreen> createState() => _GodsCakeWebViewScreenState();
}

class _GodsCakeWebViewScreenState extends State<GodsCakeWebViewScreen> {
  final Uri _homeUri = Uri.parse(kHomeUrl);
  final Connectivity _connectivity = Connectivity();

  late final WebViewController _controller;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  bool _isLoading = true;
  bool _isOffline = false;
  bool _hasPageError = false;
  bool _hasInitialLoadCompleted = false;
  double _pageProgress = 0.0;
  DateTime? _lastBackPress;

  @override
  void initState() {
    super.initState();
    _setupWebView();
    _listenForConnectivity();
    _checkConnectivityAndLoad();
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }

  void _setupWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (!mounted) return;
            setState(() {
              _pageProgress = progress / 100.0;
              _isLoading = progress < 100;
            });
          },
          onPageStarted: (_) {
            if (!mounted) return;
            setState(() {
              _isLoading = true;
              _hasPageError = false;
              _pageProgress = 0.0;
            });
          },
          onPageFinished: (_) async {
            if (!mounted) return;
            setState(() {
              _isLoading = false;
              _hasInitialLoadCompleted = true;
            });
          },
          onWebResourceError: (WebResourceError error) {
            if (!mounted) return;
            if (error.isForMainFrame != true) return;
            setState(() {
              _isLoading = false;
              _hasPageError = true;
            });
          },
          onNavigationRequest: (NavigationRequest request) {
            final Uri? uri = Uri.tryParse(request.url);
            if (uri == null) {
              return NavigationDecision.prevent;
            }

            final bool isInternal = _isInternalUrl(uri);
            if (isInternal) {
              return NavigationDecision.navigate;
            }

            if (uri.scheme == 'http' || uri.scheme == 'https' || uri.scheme == 'tel' || uri.scheme == 'mailto' || uri.scheme == 'sms' || uri.scheme == 'whatsapp') {
              launchUrl(uri, mode: LaunchMode.externalApplication);
              return NavigationDecision.prevent;
            }

            return NavigationDecision.prevent;
          },
        ),
      )
      ..loadRequest(_homeUri);
  }

  bool _isInternalUrl(Uri uri) {
    if (uri.scheme == 'about' || uri.scheme == 'data' || uri.scheme == 'file') {
      return true;
    }
    if (uri.scheme != 'http' && uri.scheme != 'https') {
      return false;
    }
    return uri.host == _homeUri.host;
  }

  void _listenForConnectivity() {
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      final bool offline = results.contains(ConnectivityResult.none);
      if (!mounted) return;

      if (_isOffline != offline) {
        setState(() {
          _isOffline = offline;
        });
      }

      if (!offline && (_hasPageError || !_hasInitialLoadCompleted)) {
        _reloadPage();
      }
    });
  }

  Future<void> _checkConnectivityAndLoad() async {
    final List<ConnectivityResult> results = await _connectivity.checkConnectivity();
    final bool offline = results.contains(ConnectivityResult.none);
    if (!mounted) return;
    setState(() {
      _isOffline = offline;
    });
  }

  Future<void> _reloadPage() async {
    if (_isOffline) {
      return;
    }

    if (!mounted) return;
    setState(() {
      _hasPageError = false;
      _isLoading = true;
      _pageProgress = 0.0;
    });

    await _controller.reload();
  }

  Future<bool> _handleBackPressed() async {
    final bool canGoBack = await _controller.canGoBack();
    if (canGoBack) {
      await _controller.goBack();
      return false;
    }

    final DateTime now = DateTime.now();
    final DateTime? previousPress = _lastBackPress;
    _lastBackPress = now;

    if (previousPress == null || now.difference(previousPress) > const Duration(seconds: 2)) {
      if (!mounted) return false;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Press back again to exit'),
          duration: Duration(seconds: 2),
        ),
      );
      return false;
    }

    return true;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: _handleBackPressed,
      child: Scaffold(
        body: SafeArea(
          top: false,
          bottom: false,
          child: Stack(
            children: [
              if (!_isOffline && !_hasPageError) WebViewWidget(controller: _controller),
              if (_isOffline || _hasPageError) _buildOfflineState(),
              if (_isLoading && !_isOffline && !_hasPageError) _buildLoadingOverlay(),
              if (_hasInitialLoadCompleted && _isLoading && !_isOffline && !_hasPageError) _buildTopProgressBar(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingOverlay() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFFF8A3D),
            Color(0xFFF24A61),
            Color(0xFFB71D45),
          ],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 132,
              height: 132,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.16),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: Colors.white.withOpacity(0.22)),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x40000000),
                    blurRadius: 30,
                    offset: Offset(0, 18),
                  ),
                ],
              ),
              child: SvgPicture.asset('assets/gods-cake-logo.svg'),
            ),
            const SizedBox(height: 24),
            const Text(
              'Gods Cake',
              style: TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.2,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _pageProgress > 0 ? 'Loading ${(_pageProgress * 100).round()}%' : 'Loading your sweet experience...',
              style: TextStyle(
                color: Colors.white.withOpacity(0.88),
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 20),
            const SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopProgressBar() {
    return Align(
      alignment: Alignment.topCenter,
      child: SafeArea(
        bottom: false,
        child: LinearProgressIndicator(
          value: _pageProgress == 0 ? null : _pageProgress,
          minHeight: 3,
          backgroundColor: Colors.transparent,
          color: const Color(0xFFF24A61),
        ),
      ),
    );
  }

  Widget _buildOfflineState() {
    final bool isOffline = _isOffline;
    final String title = isOffline ? 'No internet connection' : 'Could not load the page';
    final String subtitle = isOffline
        ? 'Please check your network and try again.'
        : 'The website could not be loaded right now. You can retry safely.';

    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFFFFF7F2),
            Color(0xFFFFE9DD),
          ],
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 112,
                height: 112,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x1A000000),
                      blurRadius: 18,
                      offset: Offset(0, 10),
                    ),
                  ],
                ),
                child: SvgPicture.asset('assets/gods-cake-logo.svg'),
              ),
              const SizedBox(height: 24),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF7A1E36),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 15,
                  height: 1.4,
                  color: Color(0xFF7F5A5A),
                ),
              ),
              const SizedBox(height: 22),
              FilledButton(
                onPressed: _reloadPage,
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFFF24A61),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                child: const Text('Retry'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () async {
                  await launchUrl(_homeUri, mode: LaunchMode.externalApplication);
                },
                child: const Text('Open in browser'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}










