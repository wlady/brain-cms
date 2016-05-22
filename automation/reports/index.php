<?php
error_reporting(0);

$testTypes = [
    'engine' => 'BCMS Engine',
    'module' => 'BCMS Modules',
];

$directories = [];
$dir = new DirectoryIterator(__DIR__);
foreach ($dir as $fileinfo) {
    if ($fileinfo->isDir() && !$fileinfo->isDot()) {
        $fname = $fileinfo->getPathname() . '/.dir';
        if (file_exists($fname)) {
            $directories[$fileinfo->getFilename()] = [
                'url' => $_SERVER['REQUEST_URI'] . $fileinfo->getFilename() . '/'
            ];
            $lines = file($fname);
            foreach ($lines as $line) {
                $parts = explode('=', $line);
                if (count($parts) == 2) {
                    $directories[$fileinfo->getFilename()][$parts[0]] = trim($parts[1]);
                }
            }
        }
        $fname = $fileinfo->getPathname() . '/unitreport.xml';
        if (file_exists($fname) && filesize($fname)) {
            $xml = simplexml_load_file($fname);
            if ($xml) {
                $directories[$fileinfo->getFilename()]['tests'] = (string)$xml->testsuite->attributes()->tests;
                $directories[$fileinfo->getFilename()]['failures'] = (string)$xml->testsuite->attributes()->failures;
                $directories[$fileinfo->getFilename()]['errors'] = (string)$xml->testsuite->attributes()->errors;
                $directories[$fileinfo->getFilename()]['time'] = (string)$xml->testsuite->attributes()->time;
                $directories[$fileinfo->getFilename()]['date'] = date('Y-m-d H:i:s', filectime($fname));
            }
        } else {
            $directories[$fileinfo->getFilename()]['tests'] = 'n/a';
            $directories[$fileinfo->getFilename()]['failures'] = 'n/a';
            $directories[$fileinfo->getFilename()]['errors'] = 'n/a';
            $directories[$fileinfo->getFilename()]['time'] = 'n/a';
            $directories[$fileinfo->getFilename()]['date'] = 'n/a';
        }
        $fname = $fileinfo->getPathname() . '/clover.xml';
        if (file_exists($fname) && filesize($fname)) {
            // add code coverage info from file
            $xml = simplexml_load_file($fname);
            $attributes = $xml->project->metrics->attributes();
            if ($attributes['statements'] != 0) {
                $directories[$fileinfo->getFilename()]['coverage'] = round($attributes['coveredelements'] * 100 / $attributes['elements'], 1);
            } else {
                $directories[$fileinfo->getFilename()]['coverage'] = 100;
            }
        }
    }
}
$coverageElements = $coveredCoveredelements = $coverageTotal = 0;
$coverageTotalColor = '#ff0000';
$fname = __DIR__ . '/clover.xml';
if (file_exists($fname) && filesize($fname)) {
    // add code coverage info from file
    $xml = simplexml_load_file($fname);
    $attributes = $xml->project->metrics->attributes();
    $coverageElements = $attributes['elements'];
    $coveredCoveredelements = $attributes['coveredelements'];
    if ($coverageElements != 0) {
        $coverageTotal = round($coveredCoveredelements * 100 / $coverageElements, 1);
    } else {
        $coverageTotal = 0;
    }
    if ($coverageTotal>50 && $coverageTotal<85) {
        $coverageTotalColor = '#ff5e00';
    } elseif ($coverageTotal>=85) {
        $coverageTotalColor = '#006d00';
    }
}

$results = [];
foreach ($testTypes as $testType=>$resTitle) {
    $results[$testType] = array_filter($directories, function($item) use ($testType) {
        return $item['type']==$testType ? $item : null;
    });
    ksort($results[$testType]);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Available Reports</title>
    <link href="assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
    <link href="assets/css/style-dashboard.css" rel="stylesheet">
</head>
<nobody>
    <?php
    if (!count($directories)) {
        die('Nothing found. Please run "ant" in "reports" directory');
    }
    $fileContents = file_get_contents(__DIR__ . '/generated.html');
    $host = '/';
    $date = date('r');
    if (file_exists(__DIR__. '/.job')) {
        $host = file_get_contents(__DIR__. '/.job');
        $date = date('r', filemtime(__DIR__. '/.job'));
    }
    echo '<div class="headerTop">';
    echo str_replace(['$JOB_URL', '$GENERATED_DATE'], [$host, $date], $fileContents);
    $fileContents = file_get_contents(__DIR__ . '/coverage.html');
    echo str_replace(['$COVERAGE_ELEMENTS', '$COVERAGE_COVEREDELEMENTS', '$COVERAGE_TOTAL_COLOR', '$COVERAGE'], [$coverageElements, $coveredCoveredelements, $coverageTotalColor, $coverageTotal], $fileContents);
    echo '</div>';
    foreach ($testTypes as $testType=>$resTitle) {
        $directories = $results[$testType];
        ?>
        <h1 class="tableHeader"><?=$resTitle;?></h1>
        <table class="testreports table table-bordered">
            <tr>
                <td width="10%">Name</td>
                <td width="40%">Directory</td>
                <td>Code Coverage</td>
                <td>Tests</td>
                <td>Failures</td>
                <td>Errors</td>
                <td>Time</td>
                <td>Generated</td>
            </tr>
            <?php
            $tests = $fails = $errors = 0;
            foreach ($directories as $name => $data) {
                $failures = ($data['failures'] * 100) / $data['tests'];
                if ($failures <= 25) {
                    $color = '#cdffc8'; // green
                } elseif ($failures <= 50) {
                    $color = '#ffeaa1'; // yellow
                } elseif ($failures <= 75) {
                    $color = '#ffc4a1'; // orange
                } elseif ($failures <= 100) {
                    $color = '#ffa1a1'; // red
                }
                $fColor = $data['failures'] != 0 ? 'red' : 'black';
                $eColor = $data['errors'] != 0 ? 'red' : 'black';
                echo '<tr style="background-color: ' . $color . '"><td><a href="' . $data['url'] . '">' . $data['name'] . '</a></td><td>' . $data['dir'] . '</td><td><div class="graph"><div style="width: ' . $data['coverage'] . '%" class="bar">' . $data['coverage'] . '%</div></div></td><td class="tdc">' . $data['tests'] . '</td><td class="tdc ' . $fColor . '"">' . $data['failures'] . '</td><td class="tdc ' . $eColor . '"">' . $data['errors'] . '</td><td>' . $data['time'] . '</td><td>' . $data['date'] . '</td></tr>';
                $tests += $data['tests'];
                $fails += $data['failures'];
                $errors += $data['errors'];
            }
            $fColor = $fails != 0 ? 'red' : 'black';
            $eColor = $errors != 0 ? 'red' : 'black';
            ?>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td class="tdc"><?= $tests; ?></td>
                <td class="tdc <?= $fColor; ?>"><?= $fails; ?></td>
                <td class="tdc <?= $eColor; ?>"><?= $errors; ?></td>
                <td></td>
                <td></td>
            </tr>
        </table>
    <?php
    }
    ?>
</nobody>
</html>
