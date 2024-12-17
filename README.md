# Spark plug B

## Notes
  
- T1000 devices are considered "edge of network nodes"
- The sensors connected to T1000 devices will be considered "devices" according to spark plug b documents

## Ignition Quirks

- NCMD only seems to work for REBIRTH

## EON node birth

- The bdSeq number should start at zero and increment by one on every new MQTT
CONNECT... This is handled automatically in `sparkplug-client`
- The NBIRTH can include optional ‘Node Control’ payload components. These are used by a backend
application to control aspects of the EoN node. The following are examples of Node Control metrics.
  - Metric name: ‘Node Control/Reboot’
    - Used by backend application(s) to reboot an EoN node.
  - Metric name: ‘Node Control/Rebirth’
    - Used by backend application(s) to request a new NBIRTH and DBIRTH(s) from an EoN node.
  - Metric name: ‘Node Control/Next Server’
    - Used by backend application(s) to request an EoN node to walk to the next MQTT Server in its list
    in multi-MQTT Server environments.
  - Metric name: ‘Node Control/Scan rate’
    - Used by backed application(s) to modify a poll rate on an EoN node.
- The NBIRTH message can also include optional ‘Properties’ of an EoN node. The following are examples of
Property metrics.
  - Metric name: ‘Properties/Hardware Make’
    - Used to transmit the hardware manufacturer of the EoN node
  - Metric name: ‘Properties/Hardware Model’
    - Used to transmit the hardware model of the EoN node
  - Metric name: ‘Properties/OS’
    - Used to transmit the operating system of the EoN node
  - Metric name: ‘Properties/OS Version’
    - Used to transmit the OS version of the EoN node

### EON Birth process

1. Connect to broker and set Will and Testament message (NDEATH)
1. SparkplugB client library automatically sets NDEATH information
1. subscribe to STATE, NCMD, and DCMD topics
  
    - ex. spBv1.0/group/NCMD/myNodeName/#
    - ex. spBv1.0/group/DCMD/myNodeName/#

1. publish birth message on NBIRTH topic

    - spBv1.0/group/NBIRTH/myNodeName

### DBIRTH

#### The DBIRTH message requires the following payload components

- The DBIRTH must include the a seq number in the payload and it must have a value of one greater than
the previous MQTT message from the EoN node contained unless the previous MQTT message contained
a value of 255. In this case the seq number must be 0.
  - *This is handled in sparkplug-client*
- The DBIRTH must include a timestamp denoting the DateTime the message was sent from the EoN node.
- The DBIRTH must include every metric the device will ever report on. At a minimum these metrics must
include:
  - The metric name
  - The metric datatype
  - The current value

The DBIRTH message can also include optional ‘Device Control’ payload components. These are used by a
backend application to control aspects of a device. The following are examples of Device Control metrics.

- Metric name: ‘Device Control/Reboot’
  - Used by backend application(s) to reboot a device.
- Metric name: ‘Device Control/Rebirth’
  - Used by backend application(s) to request a new DBIRTH from a device.
- Metric name: ‘Device Control/Scan rate’
  - Used by backed application(s) to modify a poll rate on a device.

The DBIRTH message can also include optional ‘Properties’ of a device. The following are examples of Property
metrics.

- Metric name: ‘Properties/Hardware Make’
  - Used to transmit the hardware manufacturer of the device
- Metric name: ‘Properties/Hardware Model’
  - Used to transmit the hardware model of the device
- Metric name: ‘Properties/FW’
  - Used to transmit the firmware version of the device
